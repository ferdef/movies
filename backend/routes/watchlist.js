const express = require('express');
const { Watchlist, EpisodeWatched, SeasonWatched } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const TMDBService = require('../services/tmdbService');
const { Op } = require('sequelize');
const router = express.Router();

const tmdb = new TMDBService(process.env.TMDB_API_KEY);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { watched, liked, media_type } = req.query;
    const where = { user_id: req.user.id };

    if (watched !== undefined) {
      where.watched = watched === 'true';
    }
    
    if (liked !== undefined) {
      where.liked = liked === 'true' ? true : (liked === 'false' ? false : null);
    }

    if (media_type) {
      where.media_type = media_type;
    }

    const items = await Watchlist.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    const itemsWithImages = items.map(item => ({
      ...item.toJSON(),
      poster_url: tmdb.getImageUrl(item.poster_path)
    }));

    res.json(itemsWithImages);
  } catch (error) {
    console.error('Error obteniendo watchlist:', error);
    res.status(500).json({ message: 'Error al obtener la lista' });
  }
});

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { tmdb_id, media_type, title, poster_path, release_date } = req.body;

    if (!tmdb_id || !media_type || !title) {
      return res.status(400).json({ message: 'Datos requeridos faltantes' });
    }

    const [item, created] = await Watchlist.findOrCreate({
      where: {
        user_id: req.user.id,
        tmdb_id,
        media_type
      },
      defaults: {
        user_id: req.user.id,
        tmdb_id,
        media_type,
        title,
        poster_path,
        release_date
      }
    });

    if (!created) {
      return res.status(409).json({ message: 'El elemento ya está en tu lista' });
    }

    res.status(201).json({
      ...item.toJSON(),
      poster_url: tmdb.getImageUrl(item.poster_path)
    });
  } catch (error) {
    console.error('Error añadiendo a watchlist:', error);
    res.status(500).json({ message: 'Error al añadir a la lista' });
  }
});

router.put('/:id/watch', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { watched } = req.body;

    const item = await Watchlist.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    await item.update({
      watched,
      watch_date: watched ? new Date() : null
    });

    res.json({
      ...item.toJSON(),
      poster_url: tmdb.getImageUrl(item.poster_path)
    });
  } catch (error) {
    console.error('Error actualizando estado de visto:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
});

router.put('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    const item = await Watchlist.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    await item.update({ liked });

    res.json({
      ...item.toJSON(),
      poster_url: tmdb.getImageUrl(item.poster_path)
    });
  } catch (error) {
    console.error('Error actualizando valoración:', error);
    res.status(500).json({ message: 'Error al actualizar valoración' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Watchlist.destroy({
      where: { id, user_id: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    res.json({ message: 'Elemento eliminado de la lista' });
  } catch (error) {
    console.error('Error eliminando de watchlist:', error);
    res.status(500).json({ message: 'Error al eliminar de la lista' });
  }
});

router.post('/episodes/watch', authenticateToken, async (req, res) => {
  try {
    const { tmdb_show_id, season_number, episode_number, watched = true } = req.body;

    const [episode, created] = await EpisodeWatched.findOrCreate({
      where: {
        user_id: req.user.id,
        tmdb_show_id,
        season_number,
        episode_number
      },
      defaults: {
        user_id: req.user.id,
        tmdb_show_id,
        season_number,
        episode_number,
        watched
      }
    });

    if (!created) {
      await episode.update({ watched });
    }

    res.json(episode);
  } catch (error) {
    console.error('Error marcando episodio:', error);
    res.status(500).json({ message: 'Error al marcar episodio' });
  }
});

router.post('/seasons/watch', authenticateToken, async (req, res) => {
  try {
    const { tmdb_show_id, season_number, watched = true } = req.body;

    const [season, created] = await SeasonWatched.findOrCreate({
      where: {
        user_id: req.user.id,
        tmdb_show_id,
        season_number
      },
      defaults: {
        user_id: req.user.id,
        tmdb_show_id,
        season_number,
        watched
      }
    });

    if (!created) {
      await season.update({ watched });
    }

    res.json(season);
  } catch (error) {
    console.error('Error marcando temporada:', error);
    res.status(500).json({ message: 'Error al marcar temporada' });
  }
});

router.get('/episodes/:showId', authenticateToken, async (req, res) => {
  try {
    const { showId } = req.params;
    
    const episodes = await EpisodeWatched.findAll({
      where: {
        user_id: req.user.id,
        tmdb_show_id: showId
      }
    });

    res.json(episodes);
  } catch (error) {
    console.error('Error obteniendo episodios vistos:', error);
    res.status(500).json({ message: 'Error al obtener episodios' });
  }
});

module.exports = router;