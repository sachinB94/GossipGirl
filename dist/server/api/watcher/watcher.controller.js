'use strict';

var _ = require('lodash');
var Watcher = require('./watcher.model');
var Util = require('../util');

var controller = {
  
  /**
   * Creates a new Watcher in the DB.
   */
  addWatcher: function (req, res, next) {
    var data = req.body;
    data.watcher = req.tokenId;

    var shouldRemove = (!data.operation || data.operation === 'update') && data.fields.length === 0;
    shouldRemove = shouldRemove || (data.operation !== 'insert' || data.operation !== 'delete') && data.remove;

    // If no fields to watch
    if (shouldRemove) {

      // Remove watcher
      Watcher.remove({
        Collection: data.Collection,
        watcher: data.watcher,
        watching: data.watching,
        operation: data.operation ? data.operation : 'update'
      }, function(err, numAffected) {
        if (err) {
          return next(Util.getMongoError(err));
        }
        req.data = {
          removed: true
        };
        return next();
      });
    } else {

      // else, add/update watcher
      Watcher.add(data, function(err, watcher) {
        if (err) {
          return next(Util.getMongoError(err));
        }
        req.data = watcher._doc;
        return next();
      });
    }
  },

  /**
   * Get watcher by watcher ID
   */
  getWatchersByWatcherId: function(req, res, next) {
    var watcherId = req.tokenId;
    Watcher.find({
      watcher: watcherId
    }, function(err, watching) {
      if (err) {
        return next(Util.getMongoError(err));
      }
      req.data = watching;
      return next();
    });
  },


  /**
   * Get watcher by watcher ID and Collection
   */
  getWatchersByWatcherIdAndCollection: function(req, res, next) {
    var watcherId = req.tokenId;
    var collection = req.params.collection;
    Watcher.find({
      watcher: watcherId,
      Collection: collection
    }, function(err, watching) {
      if (err) {
        return next(Util.getMongoError(err));
      }
      req.data = watching;
      return next();
    });
  },

  /**
   * Get all watchers
   */
  getAllWatchers: function(req, res, next) {
    Watcher.find({}, function(err, watchers) {
      if (err) {
        return next(Util.getMongoError(err)); 
      }
      req.data = watchers;
      return next();
    });
  },

  /**
   * Get all fields in the schema
   */
  getFields: function(req, res, next) {
    Watcher.getFields(function(err, fields) {
      if (err) {
        return next(Util.getMongoError(err)); 
      }
      req.data = fields;
      return next();
    });
  }
};

module.exports = controller;