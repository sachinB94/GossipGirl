'use strict';

var async = require('async');

var userTest = require('./api/user/user.spec.js');
var watcherTest = require('./api/watcher/watcher.spec.js');
var socketTest = require('./socket.spec.js');

/**
 * Test sequence
 * User tests
 * Watcher tests
 * Socket tests
 */
async.waterfall([
  function(callback) {
    userTest.test(function(users) {
      return callback(null, users);
    });
  },
  function(users, callback) {
    watcherTest.test(users, function(watchers) {
      return callback(null, users, watchers);
    });
  },
  function(users, watchers, callback) {
    socketTest.test(users, watchers, function() {
      return callback();
    });
  }
], function() {
  console.log('ALL TESTS COMPLETE');

  // Clean test database
  userTest.clean({});
  watcherTest.clean({});
});