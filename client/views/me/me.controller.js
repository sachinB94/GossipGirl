'use strict';

angular.module('gossipGirl')
  .controller('MeCtrl', function (User, Storage, Socket, $mdToast) {

    var vm = this;

    // Get current user
    vm.user = Storage.getUser();
    vm.changes = [];

    // Initialization
    (function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var latitude = position.coords.latitude.toString();
          var longitude = position.coords.longitude.toString();
          if (latitude !== vm.user.latitude || longitude !== vm.user.longitude) {
            vm.user.latitude = latitude;
            vm.user.longitude = longitude;
            vm.updateUser();
          }
        });
      }
    })();

    Socket.on('error', function(err) {
      vm.showProgressBar = false;
      $mdToast.showSimple(err.data.message);
    });

    Socket.on('updatedUser', function(data) {
      $mdToast.showSimple('Profile updated');
      vm.showProgressBar = false;
      Storage.setUser(_.assign(data.user, {
        token: vm.user.token
      }));
      vm.user = data.user;
    });

    Socket.on('change', function(data) {
      vm.changes.unshift(data);
    });

    vm.updateUser = function() {
      vm.showProgressBar = true;
      Socket.emit('updateUser', {
        user: vm.user
      });
    };

  });
