'use strict';

var mongooseWatch = require('mongoose-watch');
var validate = require('mongoose-validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: [
      validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
      })
    ]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      validate({
        validator: 'isEmail',
        message: 'Incorrect email syntax'
      })
    ]
  },
  password: {
    type: String,
    required: true
  },
  latitude: String,
  longitude: String,
  phone: {
    type: String,
    validate: [
      validate({
        validator: 'isLength',
        arguments: [10, 10],
        message: 'Phone Number should should contain 10 numbers'
      })
    ]
  },
  address: String
});

var User = mongoose.model('User', UserSchema);

// CRUD functions
module.exports = {
  create: function(data, next) {
    var user = new User(data);
    user.save(function(err) {
      return next(err, user);
    });
  },

  findOne: function(condition, next) {
    User.findOne(condition, next);
  },

  find: function(condition, next) {
    User.find(condition, '-password', next);
  },

  update: function(condition, data, params, next) {
    User.findOneAndUpdate(condition, data, params, next);
  },

  remove: function(condition, next) {
    User.remove(condition, next);
  }
};

