const User = require('./User');
const Watchlist = require('./Watchlist');
const EpisodeWatched = require('./EpisodeWatched');
const SeasonWatched = require('./SeasonWatched');

User.hasMany(Watchlist, { foreignKey: 'user_id' });
Watchlist.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(EpisodeWatched, { foreignKey: 'user_id' });
EpisodeWatched.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SeasonWatched, { foreignKey: 'user_id' });
SeasonWatched.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Watchlist,
  EpisodeWatched,
  SeasonWatched
};