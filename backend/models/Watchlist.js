const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
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
  tmdb_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  media_type: {
    type: DataTypes.ENUM('movie', 'tv'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  poster_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  release_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  watched: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  liked: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  watch_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'watchlist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'tmdb_id', 'media_type']
    }
  ]
});

module.exports = Watchlist;