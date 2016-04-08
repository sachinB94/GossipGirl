'use strict';

var socketioJwt = require('socketio-jwt');
var async = require('async');

var config = require('./environment');
var userSocket = require('../api/user/user.socket.js');

module.exports = function (io) {

  /**
   * Socket.io authentication using JWT
   */
  io.use(socketioJwt.authorize({
    secret: config.jwtSecretKey,
    handshake: true
  }));

  io.on('connection', function (socket) {

    socket.connectDate = new Date();
    socket.ip = (socket.handshake.address) ? socket.handshake.address : null;

    /**
     * Register user's socket
     */
    userSocket.register(socket);

    socket.on('disconnect', function () {
      console.log('[%s] %s disconnected.', new Date().toUTCString(), socket.ip);

      // Disconnect user's socket
      userSocket.disconnect(socket);
    });

    console.log('[%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);

  });

};
