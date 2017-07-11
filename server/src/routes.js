'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var crypto = require('crypto');

var image = require('./image/image.controller');

var path = require('path')

var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

// api Routes resources
router.get('/api/images', image.find);

router.get('/api/uploadedImages', image.findUploaded);
router.get('/api/unmoderatedImages', image.findUnmoderated);
router.get('/api/moderatedImages', image.findModerated);

router.post('/api/image/moderate', image.moderate);
router.post('/api/image', multer({ storage: storage }).single('uploadImage'), image.upload);

module.exports = router;
