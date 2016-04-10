'use strict';

var mongoose = require('mongoose');
var config = require('./config/environment');

module.exports = function (app) {

  // API
  app.use('/api/watchers', require('./api/watcher'));
  app.use('/api/users', require('./api/user'));

  app.route('/api/collections')
    .get(function(req, res) {
      var collections = Object.keys(mongoose.connections[0].collections);
      res.send(collections);
    });

  // Static data
  app.route('/:url(api|app|bower_components|assets)/*')
    .get(function (req, res) {
      res.status(404).end();
    });

  // Render index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendFile(
        app.get('appPath') + '/index.html',
        { root: config.root }
      );
    });

};
