'use strict';

require('should');
var request = require('supertest');
var async = require('async');

var server = require('../../server');
var User = require('./user.model');

exports.test = function(next) {
  describe('TESTING /api/users', function() {

    before(function(done) {
      User.remove({}, done);
    });

    var users = [{
      name: 'test name1',
      email: 'test_email1@test.com',
      password: 'test password',
      latitude: '1',
      longitude: '2',
      phone: '1234567890',
      address: 'test address1'
    }, {
      name: 'test name2',
      email: 'test_email2@test.com',
      password: 'test password',
      latitude: '1',
      longitude: '2',
      phone: '1234567890',
      address: 'test address2'
    }];

    it('POST /create: should respond with the created user object', function(done) {
      async.parallel(users.map(function(user, index) {
        return function(callback) {
          request(server)
            .post('/api/users/create')
            .send(user)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return done(err);
              }
              res.body.should.be.an.instanceof(Object).and.have.property('token');
              users[index]._id = res.body._id;
              users[index].token = res.body.token;
              return callback();
            });
        }
      }), function() {
        done();
      });
    });


    it('POST /login: should respond with the logged in user object', function(done) {
      request(server)
        .post('/api/users/login')
        .send({
          email: users[0].email,
          password: users[0].password
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          res.body.should.be.an.instanceof(Object).and.have.property('token');
          done();
        });
    });

    it('GET /: should respond with an array of user objects', function(done) {
      request(server)
        .get('/api/users')
        .set('Authorization', 'Bearer ' + users[0].token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          res.body.should.be.an.instanceof(Array);
          done();
          return next(users);
        });
    });

  });
};

exports.clean = function() {
  User.remove({}, function() {});
};
