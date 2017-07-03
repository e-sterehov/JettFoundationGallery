'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');

var image = require('./image/image.controller');

// api Routes resources
router.get('/api/images', image.find);
router.post('/api/image', multer({ dest: './uploads/'}).single('uploadImage'), image.upload);

module.exports = router;
