'use strict';

var express = require('express');
var chalk = require('chalk');
var config = require('./config/environment');
var mongoose = require('mongoose');
var glob = require('glob');
var path = require('path');
var jwt = require('jsonwebtoken');
var async = require('async');
var mubsub = require('mubsub');
var mongoWatch = require('mongo-oplog-watch');

var mongoEventHandler = require('./mongoEventHandler');
var userController = require('./api/user/user.controller.js');

var db = mongoose.connect(config.mongo.uri, config.mongo.options);

var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server, { serveClient: true });
require('./config/sockets.js')(socket);

require('./config/express')(app);

/**
 * open a watcher for syncing changes
 */
mongoose.connection.on('connected', function(data) {
  var watcher = mongoWatch(config.mongo.uri, config.mongo.options);

  watcher.on('insert', function(doc) {
    mongoEventHandler.insert(doc, function(data) {
      userController.notifyWatchers(data, doc, socket);
    });
  });
   
  watcher.on('update', function (doc) {
    mongoEventHandler.update(doc, function(data) {
      userController.notifyWatchers(data, doc, socket);
    });
  });
   
  watcher.on('delete', function (doc) {
    mongoEventHandler.delete(doc, function(data) {
      userController.notifyWatchers(data, doc, socket);
    });
  });
   
  watcher.on('error', function (error) {
    console.log('error', error);
  });
   
  watcher.on('end', function () {
    console.log('Stream ended');
  });
   
});


/**
 * Middleware for decoding the JWT token, if present
 * 
 * @callback {function}
 */
app.use(function(req, res, next) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    var token = jwt.decode(req.headers.authorization.split(' ')[1]);
    req.tokenId = token ? token.userId : null;
  }
  return next();
});

require('./routes')(app);

/**
 * Middleware to handle errors, i.e, send errors to client
 * 
 * @callback {function}
 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send(err);
});

/**
 * Start Node.js server
 * 
 * @param  {port} integer
 * @param {ip} string
 * @callback {function}
 */
server.listen(config.port, config.ip, function() {

  console.log(
    chalk.red('\nExpress server listening on port ') + chalk.yellow('%d') + chalk.red(', in ') + chalk.yellow('%s') + chalk.red(' mode.\n'),
    config.port,
    app.get('env')
  );

  if (config.env === 'development') {
    require('ripe').ready();
  }

});

module.exports = server;
