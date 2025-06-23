const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EpisodeWatched = sequelize.define('EpisodeWatched', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tmdb_show_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  season_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  episode_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  watched: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  watch_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'episodes_watched',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'tmdb_show_id', 'season_number', 'episode_number']
    }
  ]
});

module.exports = EpisodeWatched;