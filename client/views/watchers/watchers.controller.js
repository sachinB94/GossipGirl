'use strict';

angular.module('gossipGirl')
  .controller('WatchersCtrl', function(User, Storage, Watcher, Common, $mdDialog, $mdMedia, $scope, $mdToast) {

    var vm = this;

    // Get current user
    var user = Storage.getUser();

    // Initialize
    (function() {
      vm.showProgressBar = true;
      Common.getCollections(function(err, collections) {
        if (err) {
          $mdToast.showSimple(err.data.message);
        } else {
          vm.collections = collections;
          vm.showProgressBar = false;
        }
      });
    })();

    vm.selectCollection = function() {
      async.parallel({

        // Get all fields for the collection
        fields: function(callback) {
          Common.getFields(vm.selectedCollection, callback);
        },

        // Get all data for the collection
        list: function(callback) {
          Common.getAll(vm.selectedCollection, callback);
        },

        // Get watchers by watcher ID for collection
        watchers: function(callback) {
          Watcher.findByWatcherAndCollection(vm.selectedCollection, callback);
        }
      }, function(err, result) {
        if (err) {
          $mdToast.showSimple(err.data.message);
        } else {
          vm.fields = result.fields;
          vm.list = result.list;
          vm.watchers = result.watchers;
        }
      });
    };

    vm.getBackgroundColor = function(listId) {
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.watching === listId;
      });
      return pos !== -1 ? '#009688' : '#F44336';
    };

    vm.getSpecialBackgroundColor = function(operation) {
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.operation === operation;
      });
      return pos !== -1 ? '#009688' : '#F44336';
    };

    vm.toggleSpecialWatcher = function(operation) {
      vm.showProgressBar = true;
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.operation === operation;
      });
      if (pos === -1) {
        Watcher.add({
          Collection: vm.selectedCollection,
          operation: operation,
          fields: []
        }, function(err, watcher) {
          vm.showProgressBar = false;
          if (err) {
            $mdToast.showSimple(err.data.message);
          } else {
            vm.watchers.push(watcher);
            $mdToast.showSimple('Done');
          }
        });   
      } else {
        Watcher.add({
          Collection: vm.selectedCollection,
          operation: operation,
          fields: [],
          remove: true
        }, function(err, watcher) {
          vm.showProgressBar = false;
          if (err) {
            $mdToast.showSimple(err.data.message);
          } else {
            vm.watchers.splice(pos, 1);
            $mdToast.showSimple('Done');
          }
        }); 
      }
    };

    vm.openSelectFieldDialog = function(ev, listId) {
      var pos = _.findIndex(vm.watchers, function(w) {
        return w.watching === listId;
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
            currentFields: pos === -1 ? [] : vm.watchers[pos].fields,
            fields: vm.fields
          }
        })
        .then(function(fields) {
          vm.showProgressBar = true;

          // Add watcher or Update watcher fields
          Watcher.add({
            watching: listId,
            Collection: vm.selectedCollection,
            operation: 'update',
            fields: fields
          }, function(err, watcher) {
            vm.showProgressBar = false;
            if (err) {
              $mdToast.showSimple(err.data.message);
            } else {

              // Watcher is removed
              if (watcher.removed) {
                _.remove(vm.watchers, function(w) {
                  return w.watcher === user._id && w.watching === listId;
                });
              } else {

                var pos = _.findIndex(vm.watchers, function(w) {
                  return w.watching === listId && w.watcher === user._id;
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


var FieldController = ['$scope', '$mdDialog', 'fields', 'currentFields',
  function($scope, $mdDialog, fields, currentFields) {
    $scope.fields = fields;

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
      return ($scope.selected.length !== 0 && $scope.selected.length !== $scope.fields.length);
    };
    $scope.isChecked = function() {
      return $scope.selected.length === $scope.fields.length;
    };
    $scope.toggleAll = function() {
      if ($scope.selected.length === $scope.fields.length) {
        $scope.selected = [];
      } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
        $scope.selected = $scope.fields.slice(0);
      }
    };

  }
];
