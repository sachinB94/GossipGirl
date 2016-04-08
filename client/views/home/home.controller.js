'use strict';

angular.module('gossipGirl')
  .controller('HomeCtrl', function (User, Storage, $window, $mdToast) {

    var vm = this;

    vm.register = {};

    // Initialize
    (function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          vm.register.latitude = position.coords.latitude.toString();
          vm.register.longitude = position.coords.longitude.toString();
        });
      }
    })();

    vm.registerUser = function() {
      vm.showProgressBar = true;
      User.register(vm.register, function(err, user) {
        vm.showProgressBar = false;
        if (err) {
          $mdToast.showSimple(err.data.message);
        } else {
          console.log('here');
          Storage.setUser(user);
          $window.location.href = 'me';
        }
      });
    };

    vm.loginUser = function() {
      vm.showProgressBar = true;
      User.login(vm.login, function(err, user) {
        vm.showProgressBar = false;
        if (err) {
          $mdToast.showSimple(err.data.message);
        } else {
          Storage.setUser(user);
          $window.location.href = 'me';
        }
      });
    };


  });
