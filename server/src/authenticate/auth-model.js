/**
 * Configuration.
 */

var clientModel = require('./mongo/model/client'),
  tokenModel = require('./mongo/model/token'),
  userModel = require('./mongo/model/user');

/**
 * Add example client and user to the database (for debug).
 */

// function loadExampleData() {

//   var client = new clientModel({
//     clientId: 'application',
//     clientSecret: 'secret'
//   });

//   var user = new userModel({
//     id: '123',
//     username: 'pedroetb',
//     password: 'password'
//   });

//   client.save(function (err, client) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log('Created client', client);
//   });

//   user.save(function (err, user) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log('Created user', user);
//   });
// }

/*
 * Get access token.
 */

var getAccessToken = function (bearerToken, callback) {
  tokenModel.findOne({
    accessToken: bearerToken
  }, callback);
};

/**
 * Get client.
 */

var getClient = function (clientId, clientSecret, callback) {
  clientModel.findOne({
    clientId: clientId,
    clientSecret: clientSecret
  }, callback);
};

/**
 * Grant type allowed.
 */

var grantTypeAllowed = function (clientId, grantType, callback) {
  callback(false, grantType === "client_credentials");
};

/**
 * Save token.
 */

var saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  var token = new tokenModel({
    accessToken: accessToken,
    expires: expires,
    clientId: clientId,
    user: user
  });

  token.save(callback);
};

/*
 * Get user.
 */

var getUser = function (username, password, callback) {
  userModel.findOne({
    username: username,
    password: password
  }, callback);
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function (clientId, clientSecret, callback) {
  var user;

  getClient(clientId, clientSecret, function (err) {
    if (!err) {
      user = {
        username: clientId
      };
    }

    callback(false, user)
  })
};

/**
 * Export model definition object.
 */

module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  grantTypeAllowed: grantTypeAllowed,
  saveAccessToken: saveAccessToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient
};
