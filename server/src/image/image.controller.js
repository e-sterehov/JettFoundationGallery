'use strict';
var request = require('request');
var fs = require('fs');
var path = require('path');
var pemFile = path.resolve(__dirname, '../../../mykey.pem');
var tokenFile = path.resolve(__dirname, '../../../token');
var jwt = require('jsonwebtoken');
var savedImagesModel = require('./saved_image.model.js');

/**
 * GET /images
 *
 * @description
 * get images from SocialPatrol
 *
 */

function queryServer(req, res) {
  var limit = 1000;
  var date = new Date();
  var jwto;
  var hour = date.getTime() + (date.getHours() * 60 * 60 * 1000);
  var key = fs.readFileSync(pemFile);
  var assertion = {
    'iss': 'devugc@service.account',
    'exp': parseInt(hour.toString().substring(0, 10)),
    'iat': parseInt(new Date().getTime().toString().substring(0, 10)),
  };

  jwto = jwt.sign(assertion, key, {
    algorithm: 'RS256'
  });

  request.post({
    url: 'https://www.socialpatrol.net/service/oauth2/token',
    json: {
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'assertion': jwto
    }
  }, function (error, response, body) {
    if (!error) {
      console.log('token success');
      fs.writeFile(tokenFile, body.access_token);
      request.post({
          url: 'https://www.socialpatrol.net/api/external/jettfoundation',
          headers: {
            'Authorization': 'Bearer ' + body.access_token
          },
          json: {
            streams: [4674, 4675, 4731],
            offset: req.query.offset * limit,
            limit: limit
          }
        },
        function (error, response, body) {
          if (!error) {
            if (body.messageType !== 'error') {
              return res.status(200).json(body);
            } else {
              return res.status(400).json({
                errorMessage: 'Issues communicating with the server, please try again later'
              });
            }
          } else {
            console.log('ERROR');
          }
        });
    }
  });
}

/**
 * GET /uploadedImages
 *
 * @description
 * retrieve a list of uploaded images
 *
 */

function getUploadedImages(req, res) {
  savedImagesModel.find({}, (function (err, items) {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(items);
    }
  }));
}

/**
 * GET /unmoderatedImages
 *
 * @description
 * retrieve a list of uploaded unmoderated images
 *
 */

function getUnmoderatedImages(req, res) {
  savedImagesModel.find({
    moderated: false
  }, (function (err, items) {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(items);
    }
  }));
}

/**
 * GET /moderatedImages
 *
 * @description
 * retrieve a list of uploaded moderated images
 *
 */

function getModeratedImages(req, res) {
  savedImagesModel.find({
    moderated: true,
    rejected: false
  }, (function (err, items) {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(items);
    }
  }));
}

/**
 * POST /image
 *
 * @description
 * upload an image
 *
 */

function uploadImage(req, res) {
  var firstName = (req.body.firstName);
  var lastName = (req.body.lastName);
  var image = req.file;
  var fullUrl = req.protocol + '://' + req.get('host');

  addImage(image, firstName, lastName, fullUrl, function (err, body) {
    if (!err) {
      return res.status(200).json(body);
    } else {
      return res.status(400).json(err);
    }
  });
}

/**
 * POST /image/moderate
 *
 * @description
 * update image moderation status
 *
 */

function moderateImage(req, res) {
  var query = {
    '_id': req.body._id
  };
  req.newData = {};
  req.newData.moderated = req.body.moderated;
  req.newData.rejected = req.body.rejected;

  savedImagesModel.findOneAndUpdate(query, req.newData, {
    upsert: true
  }, function (err, body) {
    if (!err) {
      return res.status(200).json(body);
    } else {
      return res.status(400).json(err);
    }
  });
}

exports.find = queryServer;
exports.findUploaded = getUploadedImages;
exports.findUnmoderated = getUnmoderatedImages;
exports.findModerated = getModeratedImages;
exports.upload = uploadImage;
exports.moderate = moderateImage;


// Helper Functions

function addImage(image, firstName, lastName, url, callback) {
  var imageUpload = {};
  var validationError = validateImageForm(image, firstName, lastName);

  if (!validationError) {
    var author = {
      authorName: firstName + ' ' + lastName
    }
    imageUpload['name'] = image.filename;
    imageUpload['url'] = url + '/' + image.filename;
    imageUpload['originalName'] = image.originalname;
    imageUpload['author'] = author;
    imageUpload['moderated'] = false;
    imageUpload['rejected'] = false;

    savedImagesModel.create(imageUpload, callback);
  } else {
    callback({
      message: validationError
    });
  }

}

function validateImageForm(image, firstName, lastName) {
  var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];

  if (!image) {
    return 'No image selected';
  } else if (!firstName) {
    return 'First name not provided';
  } else if (!lastName) {
    return 'Last name not provided';
  } else if (ValidImageTypes.indexOf(image.mimetype) < 0) {
    return 'Invalid image format: must be one of the following formats: .gif .jpeg .png';
  }

  return false;
}
