import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
};

export const moviesAPI = {
  search: (query, page = 1) => 
    api.get('/movies/search', { params: { query, page } }),
  getPopularMovies: (page = 1) => 
    api.get('/movies/popular/movies', { params: { page } }),
  getPopularTV: (page = 1) => 
    api.get('/movies/popular/tv', { params: { page } }),
  getMovieDetails: (id) => api.get(`/movies/movie/${id}`),
  getTVDetails: (id) => api.get(`/movies/tv/${id}`),
  getTVSeasonDetails: (id, seasonNumber) => 
    api.get(`/movies/tv/${id}/season/${seasonNumber}`),
  getGenres: () => api.get('/movies/genres'),
};

export const watchlistAPI = {
  getWatchlist: (params = {}) => 
    api.get('/watchlist', { params }),
  addToWatchlist: (item) => api.post('/watchlist/add', item),
  markAsWatched: (id, watched) => 
    api.put(`/watchlist/${id}/watch`, { watched }),
  markAsLiked: (id, liked) => 
    api.put(`/watchlist/${id}/like`, { liked }),
  removeFromWatchlist: (id) => api.delete(`/watchlist/${id}`),
  markEpisodeWatched: (data) => 
    api.post('/watchlist/episodes/watch', data),
  markSeasonWatched: (data) => 
    api.post('/watchlist/seasons/watch', data),
  getWatchedEpisodes: (showId) => 
    api.get(`/watchlist/episodes/${showId}`),
};

export const recommendationsAPI = {
  getRecommendations: (params = {}) => 
    api.get('/recommendations', { params }),
  getPersonalizedRecommendations: (params = {}) => 
    api.get('/recommendations/based-on-likes', { params }),
};

export default api;