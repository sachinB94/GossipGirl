'use strict';

var config = require('./config/environment');

module.exports = function (app) {

  // API
  app.use('/api/changess', require('./api/changes'));
  app.use('/api/watchers', require('./api/watcher'));
  app.use('/api/users', require('./api/user'));

  // Get health of server
  app.route('/health')
    .get(function(req, res) {
      res.writeHead(200);
      res.end();
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
