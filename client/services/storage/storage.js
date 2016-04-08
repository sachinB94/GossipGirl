'use strict';

angular.module('gossipGirl')
  .service('Storage', function (localStorageService) {
    return {
      setUser: function(user) {
        return localStorageService.set('user', user);
      },

      getUser: function(user) {
        return localStorageService.get('user');
      },

      removeUser: function() {
        return localStorageService.remove('user');
      }
    };
  });
