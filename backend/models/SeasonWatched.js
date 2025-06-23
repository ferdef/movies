const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SeasonWatched = sequelize.define('SeasonWatched', {
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
  watched: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  watch_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'seasons_watched',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'tmdb_show_id', 'season_number']
    }
  ]
});

module.exports = SeasonWatched;