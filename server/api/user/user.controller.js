'use strict';

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var User = require('./user.model');
var SocketModel = require('./socket.model');
var Util = require('../util');

var controller = {
  /**
   * Creates a new User in the DB.
   */
  create: function (req, res, next) {
    var data = req.body;
    User.create(data, function(err, user) {
      if (err) {
        return next(Util.getMongoError(err));
      }
      req.data = user._doc;
      return next();
    });
  },

  /**
   * Get user by email
   */
  getUserByEmail: function(req, res, next) {
    var data = req.body;
    User.findOne({
      email: data.email
    }, function(err, user) {
      if (err) {
        return next(Util.getMongoError(err)); 
      }
      if (!user) {
        return next({
          status: 404,
          message: 'Email not found',
        });
      }
      req.data = user._doc;
      return next();
    });
  },

  /**
   * Get all users
   */
  getAllUsers: function(req, res, next) {
    User.find({}, function(err, users) {
      if (err) {
        return next(Util.getMongoError(err)); 
      }
      req.data = users;
      return next();
    });
  },

  /**
   * Get all fields in the schema
   */
  getFields: function(req, res, next) {
    User.getFields(function(err, fields) {
      if (err) {
        return next(Util.getMongoError(err)); 
      }
      req.data = fields;
      return next();
    });
  },

  /**
   * Notify the watchers of changes
   */
  notifyWatchers: function(watchers, doc, io) {

    // Map each watcher
    async.map(watchers, function(watcher, callback) {

      async.parallel({

        // Get Socket of the user
        socketModel: function(cb) {
          SocketModel.findOne({
            userId: watcher.watcher._id.toString()
          }, cb);
        },

        // Get updated user details
        user: function(cb) {
          if (watcher.watching) {
            mongoose.connections[0].collections[watcher.Collection].findOne({
              _id: watcher.watching
            }, cb);
          } else {
            return cb(null, null);
          }
        }

      }, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (result.socketModel && io.sockets.connected[result.socketModel.socketId]) {
          if (result.user) {
            var send = _.assign({}, watcher, {
              watching: _.omit(result.user, 'password')
            });
          } else {
            var send = _.assign({}, watcher, {
              document: _.omit(doc.object, 'password')
            });
          }

          // Send Notification
          io.sockets.connected[result.socketModel.socketId].emit('change', send);
        }
        return callback(null);
      });
    }, function(err) {
      if (err) {
        console.log('err', err);
      }
      // All watchers notified
    });
  }
  
};

module.exports = controller;
