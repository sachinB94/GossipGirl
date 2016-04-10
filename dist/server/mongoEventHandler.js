var _ = require('lodash');
var async = require('async');

var watcherModel = require('./api/watcher/watcher.model');
var userModel = require('./api/user/user.model');

var mongoEventHandler = {
  insert: function(doc, next) {
    watcherModel.find({
      Collection: doc.collection,
      operation: 'insert'
    }, function(err, watchers) {
      if (err) {
        console.log('err', err);
      } else {
        return next(watchers.map(function(watcher) {
          return watcher._doc;
        }));
      }
    });
  },

  update: function(doc, next) {
    var updatedFields = Object.keys(doc.object.set);

    async.waterfall([
      
      // Find the users watching the update
      function(callback) {
        watcherModel.find({
          watching: doc.query._id
        }, callback);
      },

      // Check if the field(s) being watched are updated
      function(watchers, callback) {
        var updatedWatchers = [];
        watchers.forEach(function(watcher) {
          watcher = watcher._doc;
          var updates = {};
          updatedFields.forEach(function(field) {
            if (watcher.fields.indexOf(field) !== -1) {
              updates[field] = doc.object.set[field];
            }
          });
          if (updates !== {}) {
            updatedWatchers.push(_.assign({}, watcher, {
              updates: updates
            }));
          }
        });
        return callback(null, updatedWatchers);
      }
    ], function(err, watchers) {
      if (err) {
        console.log('err', err);
      } else {
        return next(watchers);
      }
    });
    
  },

  delete: function(doc, next) {
    watcherModel.find({
      Collection: doc.collection,
      operation: 'delete'
    }, function(err, watchers) {
      if (err) {
        console.log('err', err);
      } else {
        return next(watchers.map(function(watcher) {
          return watcher._doc;
        }));
      }
    });
  }
};

module.exports = mongoEventHandler;