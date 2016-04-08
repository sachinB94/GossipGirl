'use strict';

angular.module('gossipGirl')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/me/watchers', {
        templateUrl: 'views/watchers/watchers.html',
        controller: 'WatchersCtrl',
        controllerAs: 'vm'
      });
  });
