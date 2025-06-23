const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: TMDB_BASE_URL,
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }

  async searchMulti(query, page = 1) {
    try {
      const response = await this.client.get('/search/multi', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error searching TMDB: ${error.message}`);
    }
  }

  async getMovieDetails(movieId) {
    try {
      const response = await this.client.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error getting movie details: ${error.message}`);
    }
  }

  async getTVDetails(tvId) {
    try {
      const response = await this.client.get(`/tv/${tvId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error getting TV details: ${error.message}`);
    }
  }

  async getTVSeasonDetails(tvId, seasonNumber) {
    try {
      const response = await this.client.get(`/tv/${tvId}/season/${seasonNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error getting TV season details: ${error.message}`);
    }
  }

  async getPopularMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error getting popular movies: ${error.message}`);
    }
  }

  async getPopularTV(page = 1) {
    try {
      const response = await this.client.get('/tv/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error getting popular TV shows: ${error.message}`);
    }
  }

  async discoverMovies(filters = {}) {
    try {
      const params = {
        sort_by: 'popularity.desc',
        ...filters
      };
      
      const response = await this.client.get('/discover/movie', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error discovering movies: ${error.message}`);
    }
  }

  async discoverTV(filters = {}) {
    try {
      const params = {
        sort_by: 'popularity.desc',
        ...filters
      };
      
      const response = await this.client.get('/discover/tv', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error discovering TV shows: ${error.message}`);
    }
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  async getGenres() {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        this.client.get('/genre/movie/list'),
        this.client.get('/genre/tv/list')
      ]);
      
      return {
        movie: movieGenres.data.genres,
        tv: tvGenres.data.genres
      };
    } catch (error) {
      throw new Error(`Error getting genres: ${error.message}`);
    }
  }
}

module.exports = TMDBService;