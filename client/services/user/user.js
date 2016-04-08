'use strict';

angular.module('gossipGirl')
  .service('User', function (Restangular) {

    return {
      register: function(data, next) {
        Restangular
          .one('users')
          .all('create')
          .post(data)
          .then(function(user) {
            return next(null, user.plain());
          }, function(err) {
            return next(err, null);
          });
      },
      login: function(data, next) {
        Restangular
          .one('users')
          .all('login')
          .post(data)
          .then(function(user) {
            return next(null, user.plain());
          }, function(err) {
            return next(err, null);
          });
      },
      getAll: function(next) {
        Restangular
          .one('users')
          .get()
          .then(function(user) {
            return next(null, user);
          }, function(err) {
            return next(err, null);
          });  
      },
      update: function(data, next) {
        Restangular
          .one('users')
          .all('update')
          .post(data)
          .then(function(user) {
            return next(null, user.plain());
          }, function(err) {
            return next(err, null);
          });
      },
    };
  });
