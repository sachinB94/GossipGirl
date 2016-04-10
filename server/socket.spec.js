'use strict';

require('should');
var _ = require('lodash');
var request = require('supertest');
var async = require('async');
var io = require('socket.io-client');

var User = require('./api/user/user.model');
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

    var testUser = {
      name: 'test name3',
      email: 'test_email3@test.com',
      password: 'test password',
      latitude: '1',
      longitude: '2',
      phone: '1234567890',
      address: 'test address3'
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


    it('CHANGE EVENT: should trigger handle the change event', function(done) {

      var eventTriggered = 0;

      connections[users[0]._id].on('change', function(data) {
        ++eventTriggered;
        if (data.operation === 'update') {
          data.watching.should.be.an.instanceof(Object).and.have.property('_id');;
        } else {
          data.document.should.be.an.instanceof(Object).and.have.property('_id');
        }
        if (eventTriggered === 3) {
          done();
        }
      });

      var newUser = users[1];
      newUser.name = 'new name';

      connections[users[1]._id].emit('updateUser', {
        user: _.omit(newUser, ['password', 'token'])
      });

      connections[users[1]._id].on('updatedUser', function(data) {
        users[1].name = data.user.name;
        data.user.should.be.an.instanceof(Object).and.have.property('name', 'new name');
      });

      request(server)
        .post('/api/users/create')
        .send(testUser)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          res.body.should.be.an.instanceof(Object).and.have.property('token');
          testUser._id = res.body._id;
          testUser.token = res.body.token;

          User.remove({
            _id: testUser._id
          }, function(err, nRemoved) {
            (err === null).should.be.true;
            nRemoved.result.n.should.be.exactly(1);
          });

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
