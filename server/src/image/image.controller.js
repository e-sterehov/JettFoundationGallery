'use strict';
var request = require('request');
var fs = require('fs');
var path = require('path');
var pemFile = path.resolve(__dirname, '../../../mykey.pem');
var tokenFile = path.resolve(__dirname, '../../../token');
var jwt = require('jsonwebtoken');

/**
 * GET /images
 *
 * @description
 * list of things
 *
 */

function queryServer(req, res) {
console.log('here test');
  var offset = req.offset;
  var limit = 20;
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
            streams: [2407, 2421],
            offset: req.query.offset * limit,
            limit: limit
          }
        },
        function (error, response, body) {
          if (!error) {
            if (body.messageType !== 'error') {
              return res.status(200).json(body);
            } else {
              return res.status(200).json({
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
 * POST /image
 *
 * @description
 * list of things
 *
 */

function uploadImage(req, res) {
  console.log(req.body);
  return res.status(200).json();
}

exports.find = queryServer;
exports.upload = uploadImage;

// function refreshToken(req, res, callback) {
//   var date = new Date();
//   var jwto;
//   var hour = date.getTime() + (date.getHours() * 60 * 60 * 1000);
//   var key = fs.readFileSync(pemFile);
//   var assertion = {
//     'iss': 'devugc@service.account',
//     'exp': parseInt(hour.toString().substring(0, 10)),
//     'iat': parseInt(new Date().getTime().toString().substring(0, 10)),
//   };

//   jwto = jwt.sign(assertion, key, { algorithm: 'RS256' });

//   request.post({
//     url: 'https://www.socialpatrol.net/service/oauth2/token',
//     json: {
//       'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
//       'assertion': jwto
//     }
//   }, function (error, response, body) {
//     if (!error) {
//       console.log('token success');
//       fs.writeFile(tokenFile, body.access_token);
//       callback(req, res);
//     }
//   });
// }
