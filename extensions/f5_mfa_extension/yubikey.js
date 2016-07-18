var yub = require('yub');


var exports = module.exports = {};

yub.init("29038", "i9iFXoi1AXiWKF5pa/jAvajvkWg=");

exports.verify = function(otp, callback) {
	console.log('yubikey otp: ', otp);
	yub.verify(otp, function(err, data) {
		if(err) {
			console.log("ERROR validating otp");
			callback(err);
		} else if(data.valid) {
			callback(true);
		} else {
			console.log("Invalid OTP");
			callback('invalid OTP');
		}
	});
};
