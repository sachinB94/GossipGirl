'use strict';

var _ = require('lodash');
var User = require('./user.model');
var SocketModel = require('./socket.model');
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
      new: true
    }, function(err, user) {
      if (err) {
        socket.emit('error', Util.getMongoError(err));
      } else {

        // Emit the updated user
        socket.emit('updatedUser', {
          user: _.omit(user._doc, 'password')
        });
      }
    });



  });

};
