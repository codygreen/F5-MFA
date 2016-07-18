/*
 * iRulesLX RPC for Google Authenticator
 *
 */

/* Import the f5-nodejs module. */
var f5 = require('f5-nodejs');
var ga = require('./google_authenticator');
var User = require('./f5_user').User;
var yubikey = require('./yubikey');


// Change clientID and secret to your YubiCloud information
var clientID = ""
var secretKey = ""


/* Create a new rpc server for listening to TCL iRule calls. */
var ilx = new f5.ILXServer();

/**
  * get user secret
  *
  * @param {String} user
  * @return {String} secret
  */
ilx.addMethod('generateSecret', function(req, res) {
  var secret = ga.generateSecret(req.params()[0]);
  if(typeof secret === 'undefined') {
    console.error('could not generate a secret key');
    return;
  } else {
    res.reply(secret.base32);
  }
});

/**
  * generate QR code
  *
  * @param {String} user
  * @param {String} secret
  * @return {String} SVG XML 
  */
ilx.addMethod('generateQRCode', function(req, res) {
  var qrURL = ga.generateQRURL(req.params()[0], req.params()[1]);
  if(typeof qrURL === 'undefined') {
    console.error('no QR URL was returned, cannot create QR code');
    return;
  }
  var qrcode = ga.generateQRCode(qrURL);
  if(typeof qrcode == 'undefined') {
    console.error('could not generate a qr code');
    return;
  }else {
    res.reply(qrcode);
  }
});

/** 
  * verify token
  *
  * @param {String} token
  * @param {String} string
  * @return {Boolean} sucessful
  */
ilx.addMethod('verifyToken', function(req, res) {
  // determine if it's Google Authenticator or Yubico
  if (req.params()[1].length > 6) {
    // verify yubikey otp
    yubikey.verify(clientID, secretKey, req.params()[1], function(verify) {     
      if(verify !== true) {
        console.log('ERROR: unable to validate token for indetifier ', req.params()[0]);
        console.log('ERROR: ', verify);
        console.log('otp: ', req.params()[1]);
        console.log('verify: ', verify);
        res.reply(null);
        return
      } else {
        res.reply(1);
      }
    });
    
  } else {
    var verify = ga.verifyToken(req.params()[0], req.params()[1]);
    res.reply(verify);
  }
});

/**
  * add user to data group
  *
  * @param {String} user
  * @param {String} secret
  * @return {Boolean} successful
  */
ilx.addMethod('addUser', function(req,res) {
  var user = new User(req.params()[0]);
  user.secret = req.params()[1];
  user.add(function(response) {
    res.reply(response);
  });
});

/* Start listening for ILX::call and ILX::notify events. */
ilx.listen();



