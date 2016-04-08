'use strict';

var _ = require('lodash');
var Watcher = require('./watcher.model');
var Util = require('../util');

/**
 * Creates a new Watcher in the DB.
 */
exports.addWatcher = function (req, res, next) {
  var data = req.body;
  data.watcher = req.tokenId;

  // If no fields to watch
  if (data.fields.length === 0) {

    // Remove watcher
    Watcher.remove({
      watcher: data.watcher,
      watching: data.watching
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
};

/**
 * Get watcher by watcher ID
 */
exports.getWatchersByWatcherId = function(req, res, next) {
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
};