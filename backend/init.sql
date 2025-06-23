-- La base de datos ya se crea con las variables de entorno de Docker
-- No necesitamos crear la base de datos aquí

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de películas/series watchlist
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    release_date DATE,
    watched BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT NULL,
    watch_date TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id, media_type)
);

-- Tabla para episodios de series
CREATE TABLE IF NOT EXISTS episodes_watched (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_show_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    watched BOOLEAN DEFAULT TRUE,
    watch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_show_id, season_number, episode_number)
);

-- Tabla para temporadas completas
CREATE TABLE IF NOT EXISTS seasons_watched (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_show_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    watched BOOLEAN DEFAULT TRUE,
    watch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_show_id, season_number)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_episodes_user_show ON episodes_watched(user_id, tmdb_show_id);
CREATE INDEX IF NOT EXISTS idx_seasons_user_show ON seasons_watched(user_id, tmdb_show_id);