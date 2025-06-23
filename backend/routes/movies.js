const express = require('express');
const { Watchlist } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const TMDBService = require('../services/tmdbService');
const router = express.Router();

const tmdb = new TMDBService(process.env.TMDB_API_KEY);

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query de búsqueda requerido' });
    }

    const results = await tmdb.searchMulti(query, page);
    
    const resultsWithImages = results.results.map(item => ({
      ...item,
      poster_url: tmdb.getImageUrl(item.poster_path),
      backdrop_url: tmdb.getImageUrl(item.backdrop_path, 'w1280')
    }));

    res.json({
      ...results,
      results: resultsWithImages
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ message: 'Error al buscar contenido' });
  }
});

router.get('/popular/movies', authenticateToken, async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await tmdb.getPopularMovies(page);
    
    const moviesWithImages = results.results.map(movie => ({
      ...movie,
      poster_url: tmdb.getImageUrl(movie.poster_path),
      backdrop_url: tmdb.getImageUrl(movie.backdrop_path, 'w1280')
    }));

    res.json({
      ...results,
      results: moviesWithImages
    });
  } catch (error) {
    console.error('Error obteniendo películas populares:', error);
    res.status(500).json({ message: 'Error al obtener películas populares' });
  }
});

router.get('/popular/tv', authenticateToken, async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await tmdb.getPopularTV(page);
    
    const showsWithImages = results.results.map(show => ({
      ...show,
      poster_url: tmdb.getImageUrl(show.poster_path),
      backdrop_url: tmdb.getImageUrl(show.backdrop_path, 'w1280')
    }));

    res.json({
      ...results,
      results: showsWithImages
    });
  } catch (error) {
    console.error('Error obteniendo series populares:', error);
    res.status(500).json({ message: 'Error al obtener series populares' });
  }
});

router.get('/movie/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await tmdb.getMovieDetails(id);
    
    const movieWithImages = {
      ...movie,
      poster_url: tmdb.getImageUrl(movie.poster_path),
      backdrop_url: tmdb.getImageUrl(movie.backdrop_path, 'w1280')
    };

    res.json(movieWithImages);
  } catch (error) {
    console.error('Error obteniendo detalles de película:', error);
    res.status(500).json({ message: 'Error al obtener detalles de la película' });
  }
});

router.get('/tv/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const show = await tmdb.getTVDetails(id);
    
    const showWithImages = {
      ...show,
      poster_url: tmdb.getImageUrl(show.poster_path),
      backdrop_url: tmdb.getImageUrl(show.backdrop_path, 'w1280')
    };

    res.json(showWithImages);
  } catch (error) {
    console.error('Error obteniendo detalles de serie:', error);
    res.status(500).json({ message: 'Error al obtener detalles de la serie' });
  }
});

router.get('/tv/:id/season/:seasonNumber', authenticateToken, async (req, res) => {
  try {
    const { id, seasonNumber } = req.params;
    const season = await tmdb.getTVSeasonDetails(id, seasonNumber);
    
    const seasonWithImages = {
      ...season,
      poster_url: tmdb.getImageUrl(season.poster_path),
      episodes: season.episodes.map(episode => ({
        ...episode,
        still_url: tmdb.getImageUrl(episode.still_path, 'w300')
      }))
    };

    res.json(seasonWithImages);
  } catch (error) {
    console.error('Error obteniendo detalles de temporada:', error);
    res.status(500).json({ message: 'Error al obtener detalles de la temporada' });
  }
});

router.get('/genres', authenticateToken, async (req, res) => {
  try {
    const genres = await tmdb.getGenres();
    res.json(genres);
  } catch (error) {
    console.error('Error obteniendo géneros:', error);
    res.status(500).json({ message: 'Error al obtener géneros' });
  }
});

module.exports = router;