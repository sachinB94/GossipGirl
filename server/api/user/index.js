'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./user.controller');
var middleware = require('../middlewares');

router.post('/create', 
  middleware.encryptPassword,
  controller.create,
  middleware.sanitizeResponse,
  middleware.generateToken,
  middleware.sendResponse
);

router.post('/login',
  controller.getUserByEmail,
  middleware.comparePassword,
  middleware.sanitizeResponse,
  middleware.generateToken,
  middleware.sendResponse
);

router.get('/',
  middleware.isAuthorized,
  controller.getAllUsers,
  middleware.sendResponse
);

module.exports = router;
