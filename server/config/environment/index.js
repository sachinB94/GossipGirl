'use strict';

var path = require('path');
var _ = require('lodash');

var all = {

  env: process.env.NODE_ENV || 'development',
  root: path.normalize(__dirname + '/../../..'),

  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  jwtSecretKey: 'GossipGirl'
};

module.exports = _.merge(all, require('./' + all.env + '.js'));
