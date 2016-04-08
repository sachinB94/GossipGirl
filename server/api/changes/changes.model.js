'use strict';

var mongoose = require('mongoose');
var controller = require('./changes.controller.js');
var Schema = mongoose.Schema;

var ChangesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updates: [{
    field: String,
    old: String,
    new: String
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  capped: {
    size: 1024,
    max: 1000
  }
});

var Change = mongoose.model('Changes', ChangesSchema);

module.exports = {
  add: function(data, next) {
    var change = new Change(data);
    change.save(function(err) {
      return next(err, change);
    });
  },

  remove: function(condition, next) {
    Change.remove(condition, next);
  }
};
