'use strict';

module.exports = {
  ip: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 9000,
  mongo: {
    uri: 'mongodb://localhost/gossipgirl-dev'
  }
};
