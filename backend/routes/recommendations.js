const express = require('express');
const { Watchlist } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const TMDBService = require('../services/tmdbService');
const { Op } = require('sequelize');
const router = express.Router();

const tmdb = new TMDBService(process.env.TMDB_API_KEY);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      media_type = 'movie',
      year_from,
      year_to,
      genres,
      vote_average_min = 6,
      vote_average_max = 10,
      page = 1,
      exclude_genres
    } = req.query;

    const watchedItems = await Watchlist.findAll({
      where: {
        user_id: req.user.id,
        media_type,
        watched: true
      },
      attributes: ['tmdb_id']
    });

    const watchedIds = watchedItems.map(item => item.tmdb_id);

    const filters = {
      page,
      'vote_average.gte': vote_average_min,
      'vote_average.lte': vote_average_max
    };

    if (year_from) {
      const dateField = media_type === 'movie' ? 'primary_release_date' : 'first_air_date';
      filters[`${dateField}.gte`] = `${year_from}-01-01`;
    }

    if (year_to) {
      const dateField = media_type === 'movie' ? 'primary_release_date' : 'first_air_date';
      filters[`${dateField}.lte`] = `${year_to}-12-31`;
    }

    if (genres) {
      filters.with_genres = genres;
    }

    if (exclude_genres) {
      filters.without_genres = exclude_genres;
    }

    const results = media_type === 'movie' 
      ? await tmdb.discoverMovies(filters)
      : await tmdb.discoverTV(filters);

    const recommendations = results.results
      .filter(item => !watchedIds.includes(item.id))
      .map(item => ({
        ...item,
        poster_url: tmdb.getImageUrl(item.poster_path),
        backdrop_url: tmdb.getImageUrl(item.backdrop_path, 'w1280')
      }))
      .slice(0, 20);

    res.json({
      ...results,
      results: recommendations
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    res.status(500).json({ message: 'Error al obtener recomendaciones' });
  }
});

router.get('/based-on-likes', authenticateToken, async (req, res) => {
  try {
    const { media_type = 'movie', page = 1 } = req.query;

    const likedItems = await Watchlist.findAll({
      where: {
        user_id: req.user.id,
        media_type,
        liked: true
      },
      attributes: ['tmdb_id']
    });

    if (likedItems.length === 0) {
      return res.json({
        results: [],
        message: 'Marca algunas películas/series como "me gusta" para obtener mejores recomendaciones'
      });
    }

    const watchedItems = await Watchlist.findAll({
      where: {
        user_id: req.user.id,
        media_type
      },
      attributes: ['tmdb_id']
    });

    const watchedIds = watchedItems.map(item => item.tmdb_id);

    const recommendations = [];
    
    for (const likedItem of likedItems.slice(0, 3)) {
      try {
        const endpoint = media_type === 'movie' 
          ? `/movie/${likedItem.tmdb_id}/recommendations`
          : `/tv/${likedItem.tmdb_id}/recommendations`;
        
        const response = await tmdb.client.get(endpoint, {
          params: { page: 1 }
        });
        
        const filteredResults = response.data.results
          .filter(item => !watchedIds.includes(item.id))
          .slice(0, 5);
        
        recommendations.push(...filteredResults);
      } catch (error) {
        console.error(`Error getting recommendations for ${likedItem.tmdb_id}:`, error);
      }
    }

    const uniqueRecommendations = recommendations
      .filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      )
      .map(item => ({
        ...item,
        poster_url: tmdb.getImageUrl(item.poster_path),
        backdrop_url: tmdb.getImageUrl(item.backdrop_path, 'w1280')
      }))
      .slice(0, 20);

    res.json({
      results: uniqueRecommendations,
      total_results: uniqueRecommendations.length
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones basadas en gustos:', error);
    res.status(500).json({ message: 'Error al obtener recomendaciones personalizadas' });
  }
});

module.exports = router;