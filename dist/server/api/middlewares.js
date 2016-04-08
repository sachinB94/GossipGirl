'use strict';

var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var config = require('../config/environment');

/**
 * General Express middleware
 * @type {Object}
 */
var middleware = {

  /**
   * Check if user is authorized
   * 
   * @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  isAuthorized: function(req, res, next) {
    if (!req.tokenId) {
      return next({
        status: 401,
        message: 'Unauthorized'
      });
    }
    return next();
  },

  /**
   * Encrypt incoming password
   * 
   * @param  {[type]}* @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  encryptPassword: function(req, res, next) {
    var password = req.body.password;
    async.waterfall([
      function(callback) {
        bcrypt.genSalt(10, callback);
      },
      function(salt, callback) {
        bcrypt.hash(password, salt, null, callback);  
      }
    ], function(err, pass) {
      if (err) {
        return next(err);
      }
      req.body.password = pass;
      return next();
    });
  },

  /**
   * Compare the stored password, with incoming password
   * 
   * @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  comparePassword: function(req, res, next) {
    var password = req.body.password;
    bcrypt.compare(password, req.data.password, function(err, match) {
      if (err) {
        return next(err);
      }
      if (!match) {
        return next({
          status: 400,
          message: 'Invalid Password'
        });
      }
      return next();
    });
  },

  /**
   * Remove "password" from the response
   * 
   * @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  sanitizeResponse: function(req, res, next) {
    if (req.data && req.data.password) {
      req.data = _.omit(req.data, 'password');
    }
    return next();
  },

  /**
   * Generate JWT token
   * 
   * @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  generateToken: function(req, res, next) {
    jwt.sign({
      userId: req.data._id
    }, config.jwtSecretKey, null, function(token) {
      req.data.token = token;
      return next();
    });
  },

  /**
   * Send response
   * 
   * @param  {Object} req
   * @param  {Object} res
   * @callback  {Function} next
   */
  sendResponse: function(req, res, next) {
    res.status(200).send(req.data);
  }
};

module.exports = middleware;