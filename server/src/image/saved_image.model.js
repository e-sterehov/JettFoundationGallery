var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    authorName: {
      type: String,
      required: true
    }
  },
  moderated: {
    type: Boolean,
    required: true
  },
  rejected: {
    type: Boolean,
    required: true
  }
});
module.exports = mongoose.model('saved_images', imageSchema);
