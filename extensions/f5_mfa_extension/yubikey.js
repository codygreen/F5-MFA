var yub = require('yub');

var exports = module.exports = {};

/**
 * Verify otp
 *
 * @param {String} YubiCloud Client ID
 * @param {String} YubiCloud Secret Key
 * @param {String} otp
 */

exports.verify = function(clientID, secretKey, otp, callback) {
	yub.init(clientID, secretKey);
	yub.verify(otp, function(err, data) {
		if(err) {
			console.log("ERROR: validating otp");
			callback(err);
		} else if(data.valid) {
			callback(true);
		} else {
			console.log("ERROR: Invalid OTP");
			callback('invalid OTP');
		}
	});
};
