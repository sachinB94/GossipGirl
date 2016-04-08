var Datastore = require('nedb');
var db = new Datastore();

module.exports = {
  insert: function(data, next) {
    db.insert(data, next);
  },

  find: function(condition, next) {
    db.find(condition, next);
  },

  remove: function(condition, next) {
    db.remove(condition, next);
  }
};