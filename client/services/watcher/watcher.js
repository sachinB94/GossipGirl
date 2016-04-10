'use strict';

angular.module('gossipGirl')
  .service('Watcher', function (Restangular) {

    return {
      add: function(data, next) {
        Restangular
          .one('watchers')
          .all('add')
          .post(data)
          .then(function(user) {
            return next(null, user);
          }, function(err) {
            return next(err, null);
          });
      },

      findByWatcher: function(next) {
        Restangular
          .one('watchers')
          .one('watching')
          .get()
          .then(function(user) {
            return next(null, user);
          }, function(err) {
            return next(err, null);
          });
      },

      findByWatcherAndCollection: function(collection, next) {
        Restangular
          .one('watchers')
          .one('watching', collection)
          .get()
          .then(function(user) {
            return next(null, user);
          }, function(err) {
            return next(err, null);
          });
      }
    };

  });
