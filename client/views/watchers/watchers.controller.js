'use strict';

angular.module('gossipGirl')
  .controller('WatchersCtrl', function(User, Storage, Watcher, $mdDialog, $mdMedia, $scope, $mdToast) {

    var vm = this;

    var COLORS = ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c', '#ff8a80', '#ff5252', '#ff1744', '#d50000', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b', '#ad1457', '#880e4f', '#ff80ab', '#ff4081', '#f50057', '#c51162', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#4a148c', '#ea80fc', '#e040fb', '#d500f9', '#aa00ff', '#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7', '#5e35b1', '#4527a0', '#311b92', '#b388ff', '#7c4dff', '#651fff', '#6200ea', '#c5cae9', '#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f', '#283593', '#1a237e', '#8c9eff', '#536dfe', '#3d5afe', '#304ffe', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1', '#82b1ff', '#448aff', '#2979ff', '#2962ff', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#0277bd', '#01579b', '#80d8ff', '#40c4ff', '#00b0ff', '#0091ea', '#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064', '#84ffff', '#18ffff', '#00e5ff', '#00b8d4', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00897b', '#00796b', '#00695c', '#a7ffeb', '#64ffda', '#1de9b6', '#00bfa5', '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20', '#b9f6ca', '#69f0ae', '#00e676', '#00c853', '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38', '#558b2f', '#33691e', '#ccff90', '#b2ff59', '#76ff03', '#64dd17', '#f9fbe7', '#f0f4c3', '#e6ee9c', '#dce775', '#d4e157', '#cddc39', '#c0ca33', '#afb42b', '#9e9d24', '#827717', '#f4ff81', '#eeff41', '#c6ff00', '#aeea00', '#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17', '#ffff8d', '#ffff00', '#ffea00', '#ffd600', '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffb300', '#ffa000', '#ff8f00', '#ff6f00', '#ffe57f', '#ffd740', '#ffc400', '#ffab00', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100', '#ffd180', '#ffab40', '#ff9100', '#ff6d00', '#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722', '#f4511e', '#e64a19', '#d84315', '#bf360c', '#ff9e80', '#ff6e40', '#ff3d00', '#dd2c00', '#d7ccc8', '#bcaaa4', '#795548', '#d7ccc8', '#bcaaa4', '#8d6e63', '#eceff1', '#cfd8dc', '#b0bec5', '#90a4ae', '#78909c', '#607d8b', '#546e7a', '#cfd8dc', '#b0bec5', '#78909c'];

    // Get current user
    var user = Storage.getUser();

    // Initialize
    (function() {
      vm.showProgressBar = true;
      async.parallel([
        function(callback) {

          // Get all users
          User.getAll(function(err, users) {
            if (err) {
              $mdToast.showSimple(err.data.message);
            } else {
              vm.users = _.remove(users, function(u) {
                return u._id !== user._id;
              });
            }
            return callback();
          });
        },
        function(callback) {

          // Get all users being watched by user
          Watcher.findByWatcher(function(err, watchers) {
            if (err) {
              $mdToast.showSimple(err.data.message);
            } else {
              vm.watchers = watchers;
            }
            return callback();
          });
        }
      ], function() {
        vm.showProgressBar = false;
      });
    })();

    vm.getBackgroundColor = function(userId) {
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.watching === userId;
      });
      return pos !== -1 ? '#009688' : '#F44336';
    };

    vm.openSelectFieldDialog = function(ev, userId) {
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.watching === userId;
      });
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
      $mdDialog.show({
          controller: FieldController,
          templateUrl: 'views/watchers/fieldSelector.template.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: useFullScreen,
          locals: {
            currentFields: pos === -1 ? [] : vm.watchers[pos].fields
          }
        })
        .then(function(fields) {
          vm.showProgressBar = true;

          // Add watcher or Update watcher fields
          Watcher.add({
            watching: userId,
            fields: fields
          }, function(err, watcher) {
            vm.showProgressBar = false;
            if (err) {
              $mdToast.showSimple(err.data.message);
            } else {

              // Watcher is removed
              if (watcher.removed) {
                vm.watchers = _.filter(vm.watchers, function(w) {
                  return w.watcher !== user._id || w.watching !== userId;
                });
              } else {

                var pos = _.findIndex(vm.watchers, function(w) {
                  return w.watching === userId && w.watcher === user._id;
                });
                if (pos === -1) {

                  // Add watcher
                  vm.watchers.push(watcher);
                } else {

                  // Update watcher
                  vm.watchers[pos].fields = fields;
                }
              }
              $mdToast.showSimple('Done');
            }
          });
        });

      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    };


  });


var FieldController = ['$scope', '$mdDialog', 'WATCHABLE_FIELDS', 'currentFields',
  function($scope, $mdDialog, WATCHABLE_FIELDS, currentFields) {
    $scope.WATCHABLE_FIELDS = WATCHABLE_FIELDS;

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.submit = function() {
      $mdDialog.hide($scope.selected);
    };

    $scope.selected = currentFields;

    $scope.toggle = function(item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(item);
      }
    };
    $scope.exists = function(item, list) {
      return list.indexOf(item) > -1;
    };
    $scope.isIndeterminate = function() {
      return ($scope.selected.length !== 0 && $scope.selected.length !== $scope.WATCHABLE_FIELDS.length);
    };
    $scope.isChecked = function() {
      return $scope.selected.length === $scope.WATCHABLE_FIELDS.length;
    };
    $scope.toggleAll = function() {
      if ($scope.selected.length === $scope.WATCHABLE_FIELDS.length) {
        $scope.selected = [];
      } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
        $scope.selected = $scope.WATCHABLE_FIELDS.slice(0);
      }
    };

  }
];
