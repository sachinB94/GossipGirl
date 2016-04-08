'use strict';

require('should');
var _ = require('lodash');
var request = require('supertest');
var async = require('async');
var io = require('socket.io-client');

var config = require('./config/environment');
var server = require('./server');

exports.test = function(users, watchers, next) {
  describe('TESTING Sockets', function() {

    var connections = {};

    var options = {
      transports: ['websocket'],
      autoConnect: true,
      forceNew: true
    };

    it('CONNECT: should respond with an array of connections', function(done) {

      /**
       * Connect each user through socket
       * 
       * @param {array} users
       * @callback {function}
       */
      async.map(users, function(user, callback) {
        var client = io('http://' + config.ip + ':' + config.port, {
          transports: ['websocket'],
          'force new connection': true,
          path: '/socket.io',
          query: 'token=' + user.token
        });

        client.on('connect', function() {
          connections[user._id] = client;
          return callback();
        });
      }, function() {
        connections.should.be.and.instanceof(Object);
        done();
      });
      
    });

    it('UPDATE USER: should respond with the updated user', function(done) {
      var newUser = users[1];
      newUser.name = 'new name';
      
      connections[users[1]._id].emit('updateUser', {
        user: _.omit(newUser, 'password')
      });

      connections[users[1]._id].on('updatedUser', function(data) {
        users[1].name = data.user.name;
        data.user.should.be.an.instanceof(Object).and.have.property('name', 'new name');
        done();
      });

    });

    it('CHANGES: should respond with the changed object', function() {
      connections[users[0]._id].on('change', function(data) {
        data.user.should.be.an.instanceof(Object).and.have.property('_id');
        data.updates.should.be.an.instanceof(Array).and.not.be.empty();
      });
    });

    /**
     * Disconnect all sockets
     */
    it('DISCONNECT', function(done) {
      for (var key in connections) {
        connections[key].disconnect();
      }
      done();
      return next();
    });

  });
};