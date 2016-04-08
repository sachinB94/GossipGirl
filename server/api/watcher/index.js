'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./watcher.controller');
var middleware = require('../middlewares');

router.post('/add',
  middleware.isAuthorized,
  controller.addWatcher,
  middleware.sendResponse  
);

router.get('/watching',
  middleware.isAuthorized,
  controller.getWatchersByWatcherId,
  middleware.sendResponse
);

module.exports = router;
