'use strict';

module.exports = {
  ip: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 8080,
  mongo: {
    uri: 'mongodb://gossipgirl:gossipgirl@ds021010.mlab.com:21010/gossipgirl'
  }
};
