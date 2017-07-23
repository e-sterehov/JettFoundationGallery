'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');
var path = require('path')
var image = require('./image/image.controller');

var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

// Authenticate
router.use(bodyParser.urlencoded({
  extended: true
}));

router.use(bodyParser.json());

var oauth = oauthserver({
  model: require('../src/authenticate/auth-model.js'),
  grants: ['password', 'client_credentials'],
  debug: true
});

router.all('/api/oauth2/token', oauth.grant());

// api Routes resources
router.get('/api/images', image.find);

router.get('/api/uploadedImages', oauth.authorise(), image.findUploaded);
router.get('/api/unmoderatedImages', image.findUnmoderated);
router.get('/api/moderatedImages', image.findModerated);

router.post('/api/image/moderate', image.moderate);
router.post('/api/image', multer({
  storage: storage
}).single('uploadImage'), image.upload);

router.use(oauth.errorHandler());

module.exports = router;
