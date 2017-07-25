'use strict';

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config/';

var express = require('express');
var config = require('config');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./src/routes');

mongoose.connect('mongodb://jettfoundation:foundation@ec2-54-91-153-241.compute-1.amazonaws.com/jett_foundation');

/**
 * Express app configurations
 */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Enable CORS
app.use(cors());

// Bootstrap routes
app.use(routes);

// Static files
app.use('/', express.static(__dirname + '/../public'));

// Once database open, start server
app.listen(config.APP_PORT, function () {
  console.log('app listening on port %d in %s mode', this.address().port, app.settings.env);
});

module.exports = app;
