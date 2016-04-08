'use strict';

angular.module('gossipGirl')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/me', {
        templateUrl: 'views/me/me.html',
        controller: 'MeCtrl',
        controllerAs: 'vm'
      });
  });
