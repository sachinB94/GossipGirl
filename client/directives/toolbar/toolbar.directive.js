'use strict';

angular.module('gossipGirl')
  .directive('toolbar', function () {
    return {
      restrict: 'EA',
      templateUrl: 'directives/toolbar/toolbar.html',
      controllerAs: 'toolbar',
      controller: function(Storage) {
        var toolbar = this;

        toolbar.user = Storage.getUser();

        toolbar.gotoSelectWatchers = function() {
          window.location.href = 'me/watchers';
        };

        toolbar.logout = function() {
          Storage.removeUser();
          window.location.href = '';
        };
      }
    };
  });
