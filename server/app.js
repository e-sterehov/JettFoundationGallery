'use strict';

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config/';

var express = require('express');
var config = require('config');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var oauthserver = require('oauth2-server');

var routes = require('./src/routes');

mongoose.connect('mongodb://jettfoundation:foundation@ec2-54-86-188-99.compute-1.amazonaws.com/jett_foundation');

/**
 * Express app configurations
 */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
// Authenticate

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.oauth = oauthserver({
  model: require('./src/authenticate/auth-model.js'),
  grants: ['password', 'client_credentials'],
  debug: true
});

app.all('/api/oauth2/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
  res.send('Congratulations, you are in a secret area!');
});

app.use(app.oauth.errorHandler());

// Enable CORS
app.use(cors());

// Bootstrap routes
app.use(routes);

// Static files
app.use('/', express.static(path.resolve('uploads')));

// Once database open, start server
app.listen(config.APP_PORT, function () {
  console.log('app listening on port %d in %s mode', this.address().port, app.settings.env);
});

module.exports = app;
