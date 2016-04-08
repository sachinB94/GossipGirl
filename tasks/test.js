'use strict';

/**
 * Test tasks
 */

var gulp        = require('gulp');
var chalk       = require('chalk');
var plumber     = require('gulp-plumber');
var mocha       = require('gulp-mocha');

/**
 * Log. With options.
 *
 * @param {String} msg
 * @param {Object} options
 */
function log (msg, options) {
  options = options || {};
  console.log(
    (options.padding ? '\n' : '')
    + chalk.yellow(' > ' + msg)
    + (options.padding ? '\n' : '')
  );
}

function testServer (done) {

  log('Running server tests...', { padding: true });

  // gulp.src('server/**/*.spec.js', { read: false })
  gulp.src('server/server.spec.js', { read: false })
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec', timeout: 5000 }))
    .once('error', function (err) { done(err); })
    .once('end', function () { done(0); });
}

exports.test = function (done) {
  process.env.NODE_ENV = 'test';
  var arg = process.argv[3] ? process.argv[3].substr(2) : false;
  if (arg === 'server' || arg === false) {
    return testServer(function (code) {
      done(code);
      process.exit(code);
    });
  } else {
    console.log('Wrong parameter [%s], availables : --client, --server', arg);
  }
};
