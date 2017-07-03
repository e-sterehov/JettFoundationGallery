'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');

var image = require('./image/image.controller');

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });
// var upload = multer({
//   storage: storage
// });

// api Routes resources
router.get('/api/images', image.find);
router.post('/api/image', multer({ dest: './uploads/'}).single('uploadImage'), image.upload);
// router.post('/api/image', multer({ dest: './uploads/'}).single('uploadImage'), function (req, res) {
//   console.log(req.body);
//   console.log(req.files[0]);
//   return res.status(200).json();
// });

module.exports = router;
