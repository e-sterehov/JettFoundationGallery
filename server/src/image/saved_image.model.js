var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
    path: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  });
module.exports = mongoose.model('saved_images', imageSchema);