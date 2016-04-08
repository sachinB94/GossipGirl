'use strict';

var _ = require('lodash');
var User = require('./user.model');
var SocketModel = require('./socket.model');
var Change = require('../changes/changes.model');
var Util = require('../util');

/**
 * Disconnect and remove socket's entry
 * 
 * @param  {Object}
 */
exports.disconnect = function(socket) {
  SocketModel.remove({
    socketId: socket.id
  }, function(err, numRemoved) {
    if (err) {
      console.log('ERROR: ', err);
    }
  });
};

/**
 * Register socket
 * 
 * @param  {Object}
 */
exports.register = function (socket) {

  var userId = socket.decoded_token.userId;

  // Add socket's entry
  SocketModel.insert({
    socketId: socket.id,
    userId: userId
  }, function(err, data) {
    if (err) {
      console.log('ERROR: ', err);
    }
  });

  // On receiving update user event
  socket.on('updateUser', function(data) {
    User.update({
      _id: userId
    }, _.omit(data.user, ['_id', 'email']), {
      new: false
    }, function(err, user) {
      if (err) {
        socket.emit('error', Util.getMongoError(err));
      } else {
        var oldUser = user._doc;
        var newUser = _.assign({}, oldUser, data.user);

        // Emit the updated user
        socket.emit('updatedUser', {
          user: _.omit(newUser, 'password')
        });

        // Get the updates being watched
        var updates = _.reduce(newUser, function(result, value, key) {
          return _.isEqual(value, oldUser[key]) ? result : result.concat(key);
        }, []);
        updates = _.pull(updates, '_id', 'token');
        
        // Add the changes for updates being watched
        Change.add({
          userId: newUser._id,
          updates: updates.map(function(update) {
            return {
              field: update,
              old: oldUser[update],
              new: newUser[update]
            };
          })
        }, function(err, change) {
          if (err) {
            console.log('err', err);
          }
        });
      }
    });



  });

  // User.schema.post('save', function (doc) {
  //   socket.emit('User:save', doc);
  // });

  // User.schema.post('remove', function (doc) {
  //   socket.emit('User:remove', doc);
  // });

};
