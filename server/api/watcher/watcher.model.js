'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatcherSchema = new Schema({
  watcher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  watching: {
    type: Schema.Types.ObjectId
  },
  Collection: String,
  operation: {
    type: String,
    enum: ['insert', 'update', 'delete'],
    default: 'update'
  },
  fields: [String]
});

var Watcher = mongoose.model('Watcher', WatcherSchema);

module.exports = {
  add: function(data, next) {
    Watcher.findOneAndUpdate({
      Collection: data.Collection,
      watcher: data.watcher,
      watching: data.watching,
      operation: data.operation ? data.operation : 'update'
    }, {
      Collection: data.Collection,
      operation: data.operation,
      watcher: data.watcher,
      watching: data.watching,
      fields: data.fields
    }, {
      upsert: true,
      new: true
    }, next);
  },

  find: function(condition, next) {
    Watcher
      .find(condition)
      .populate('watcher', '-password')
      .exec(next);
  },

  remove: function(condition, next) {
    Watcher.remove(condition, next);
  },

  getFields: function(next) {
    var fields = Object.keys(WatcherSchema.paths);
    _.remove(fields, function(field) {
      return field === '__v' || field === '_id';
    });
    return next(null, fields);
  }
};