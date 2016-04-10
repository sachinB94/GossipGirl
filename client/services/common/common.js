'use strict';

angular.module('gossipGirl')
  .service('Common', function (Restangular) {

    return {
      getCollections: function(next) {
        Restangular
          .one('collections')
          .get()
          .then(function(collections) {
            return next(null, collections.plain());
          }, function(err) {
            return next(err, null);
          });
      },

      getFields: function(collection, next) {
        Restangular
          .one(collection)
          .one('fields')
          .get()
          .then(function(fields) {
            return next(null, fields.plain());
          }, function(err) {
            return next(err, null);
          });
      },

      getAll: function(collection, next) {
        Restangular
          .one(collection)
          .get()
          .then(function(data) {
            return next(null, data.plain());
          }, function(err) {
            return next(err, null);
          });
      }
    };

  });
