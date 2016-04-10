'use strict';

require('should');
var _ = require('lodash');
var request = require('supertest');
var async = require('async');

var server = require('../../server');
var Watcher = require('./watcher.model');

exports.test = function(users, next) {
  describe('TESTING /api/watchers', function() {

    before(function(done) {
      Watcher.remove({}, done);
    });

    var watchers = [{
      watcherToken: users[0].token,
      watching: users[1]._id,
      fields: ['name', 'address'],
      operation: 'update',
      Collection: 'users'
    }, {
      watcherToken: users[0].token,
      operation: 'insert',
      Collection: 'users'
    }, {
      watcherToken: users[0].token,
      operation: 'delete',
      Collection: 'users'
    }];

    it('POST /add: should respond with the added watcher object', function(done) {
      async.parallel(watchers.map(function(watcher, index) {
        return function(callback) {
          request(server)
            .post('/api/watchers/add')
            .send(watcher)
            .set('Authorization', 'Bearer ' + watcher.watcherToken)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }
              res.body.should.be.an.instanceof(Object).and.have.property('_id');
              watchers[index] = _.assign(watcher, res.body);
              return callback();
            });
        }
      }), function() {
        done();
      });
    });

    it('GET /watching: should respond with an array of watchers', function(done) {
      async.parallel(watchers.map(function(watcher, index) {
        return function(callback) {
          request(server)
            .get('/api/watchers/watching')
            .set('Authorization', 'Bearer ' + watcher.watcherToken)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }
              res.body.should.be.an.instanceof(Array);
              return callback();
            });
        }
      }), function() {
        done();
      });
    });

    it('GET /watching/:collection: should respond with an array of watchers', function(done) {
      async.parallel(watchers.map(function(watcher, index) {
        return function(callback) {
          request(server)
            .get('/api/watchers/watching/users')
            .set('Authorization', 'Bearer ' + watcher.watcherToken)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }
              res.body.should.be.an.instanceof(Array);
              return callback();
            });
        }
      }), function() {
        done();
      });
    });

    it('GET /fields: should respond with an array of fields', function(done) {
      async.parallel(watchers.map(function(watcher, index) {
        return function(callback) {
          request(server)
            .get('/api/watchers/fields')
            .set('Authorization', 'Bearer ' + watcher.watcherToken)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }
              res.body.should.be.an.instanceof(Array);
              return callback();
            });
        }
      }), function() {
        done();
        return next(watchers);
      });
    });


    
  });
};

exports.clean = function() {
  Watcher.remove({}, function() {});
};
