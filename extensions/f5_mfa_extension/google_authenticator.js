var speakeasy = require('speakeasy');
var qr = require('qr-image');


var exports = module.exports = {};

var secretLength = 12; // length of ASCII secret
var secretIssuer = "F5 Networks";

/**
 * Generate a QR Code
 *
 * @param {String} url
 * @return {Image} QR Code image
 */
exports.generateQRCode = function(url) {
		return qr.imageSync(url, {type: 'svg', size: 5});
};

/**
 * Generate a QR RUL
 *
 * @param {String} user
 * @param {String} base32 secret
 * @return {String} TOTP URL for Google Authenticator
 */
exports.generateQRURL = function(user, base32secret) {
	return speakeasy.otpauthURL({
		secret: base32secret,
		label: user,
		issuer: secretIssuer,
		encoding: "base32"
	});
};

/**
 * Generate a secret key
 *
 * @param {String} user
 * @return {Object} user object containing various flavors of the key.
 */
exports.generateSecret = function(user) {
	//callback(speakeasy.generateSecret({length: 20}).base32);
	return speakeasy.generateSecret({
		length: secretLength,
		otpauth_url: true,
		name: user
	});

};

/**
 * generate a token
 *
 * @param {String} base 32 secret
  * @return {String} 6 digit token
 */
exports.generateToken = function(base32secret) {
	return speakeasy.totp({
		secret: base32secret,
		encoding: 'base32'
	});
};

/**
 * validates google authenticator token
 *
 * @param {String} base 32 secret
 * @param {String} token
 * @return {Boolean} if token is valid
 */
exports.verifyToken = function(base32secret, userToken) {
	return speakeasy.totp.verify({ 
		secret: base32secret,
		encoding: 'base32',
		token: userToken,
		window: 2
	});
};


