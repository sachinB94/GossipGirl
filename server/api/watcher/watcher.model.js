'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatcherSchema = new Schema({
  watcher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  watching: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fields: [String]
});

var Watcher = mongoose.model('Watcher', WatcherSchema);

module.exports = {
  add: function(data, next) {
    Watcher.findOneAndUpdate({
      watcher: data.watcher,
      watching: data.watching
    }, {
      watcher: data.watcher,
      watching: data.watching,
      fields: data.fields
    }, {
      upsert: true,
      new: true
    }, next);
  },

  find: function(condition, next) {
    Watcher.find(condition, next);
  },

  remove: function(condition, next) {
    Watcher.remove(condition, next);
  }
};