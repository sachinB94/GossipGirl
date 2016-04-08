'use strict';

angular.module('gossipGirl', [
  'ngRoute',
  'btford.socket-io',
  'restangular',
  'LocalStorageModule',
  'ngMaterial'
])
  .constant('WATCHABLE_FIELDS', [
    'name',
    'latitude',
    'longitude',
    'phone',
    'address'
  ])
  .config(function ($routeProvider, $locationProvider, RestangularProvider, StorageProvider) {

    // Set base URL for Restangular
    RestangularProvider.setBaseUrl('api');

    // Attach user's token to Authorization header
    RestangularProvider.setFullRequestInterceptor(function(element, operation, route, url, headers, params) {
        var user = StorageProvider.$get().getUser();
        if (user && user.token) {
          return {
              element: element,
              params: params,
              headers: _.extend(headers, {
                  Authorization: 'Bearer ' + user.token
              })
          };
        }
    });

    // If no route matches
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

  })
  .run(function ($rootScope, $location, Storage) {

    // Check if user is authorized to access the path
    $rootScope.$on('$routeChangeSuccess', function () {
      var user = Storage.getUser();
      var path = $location.path();

      if (user && user.token && path === '/') {
        window.location.href = '/me';
      } else if ((!user || !user.token) && path.substr(0, 3) === '/me') {
        window.location.href = '';
      }
    });
  });
