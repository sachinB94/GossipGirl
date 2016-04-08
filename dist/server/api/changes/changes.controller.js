'use strict';

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Changes = require('./changes.model');
var SocketModel = require('../user/socket.model');
var Watcher = require('../watcher/watcher.model');
var User = require('../user/user.model');

/**
 * Parse the changes and notify watchers
 * 
 * @param  {Object}
 * @param  {Object}
 */
exports.changeMade = function(change, io) {
  async.parallel({

    // Find the user whose data is updated
    user: function(cb) {
      User.findOne({
        _id: change.userId
      }, cb);
    },
    watchers: function(cb) {
      async.waterfall([

        // Find watchers watching the updated user
        function(callback) {
          Watcher.find({
            watching: change.userId
          }, callback);
        },

        // Check if any watcher exists
        function(watchers, callback) {
          if (watchers.length === 0) {
            return callback('No one is watching you', null);
          }
          return callback(null, watchers);
        },

        // Find Sockets for watcher
        function(watchers, callback) {
          var watcherIds = watchers.map(function(watcher) {
            return watcher.watcher.toString();
          });
          SocketModel.find({
            userId: {
              $in: watcherIds
            }
          }, function(err, watcherSockets) {
            return callback(err, watcherSockets, watchers);
          });
        },

        // Find fields being watcher
        function(watcherSockets, watcherUsers, callback) {

          // Check if any watcher is online
          if (watcherSockets.length === 0) {
            return callback('None of your watchers are online', null);
          }
          var watchers = [];
          watcherSockets.map(function(sockets) {
            
            // Get the index of the watcher
            var pos = _.findIndex(watcherUsers, function(w) {
              return w.watcher.toString() === sockets.userId;
            });

            var user = {};
            user.updates = []
            
            // Get the old and updated fields being watched
            change.updates.forEach(function(update) {
              if (watcherUsers[pos].fields.indexOf(update.field) !== -1) {
                user.updates.push(update);
              }
            });

            // Attach the user's socket ID
            user.socketId = sockets.socketId;

            // If at least one field being watched is updated
            if (user.updates.length !== 0) {

              // Add the user to the watcher's array
              watchers.push(_.assign({}, watcherUsers[pos]._doc, user));
            }
          });
          return callback(null, watchers);
        }
      ], cb);
    }
  }, function(err, result) {
    if (!err) {

      // Emit the changes to each watcher
      async.map(result.watchers, function(watcher) {
        if (io.sockets.connected[watcher.socketId]) {
          io.sockets.connected[watcher.socketId].emit('change', {
            user: _.omit(result.user, 'password'),
            updates: watcher.updates
          });
        }
      }, function() {
        // do nothing
      });      
    }
  });
};
