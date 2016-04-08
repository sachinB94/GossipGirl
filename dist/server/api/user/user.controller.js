'use strict';

var _ = require('lodash');
var User = require('./user.model');
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
  }
  
};

module.exports = controller;
