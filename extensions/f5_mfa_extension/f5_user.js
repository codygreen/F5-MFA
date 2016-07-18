var dg = require('./f5_data_group');

exports.User = function(name) {
	var self = this;
	
	self.name = name;
	self.enrolled = false;
	self.secret = "";

	this.methods = {};


	/**
	* get user secret
	*
	* @return {String} secret
	*/
	this.getSecret = function(callback) {
		dg.getData(self.name, function (secret) {
			if(typeof secret === 'undefined') {
				console.error('user not found, no secret returned');
				callback(undefined);
				return;
			}
			this.secret = undefined;
			this.enrolled = true;
			callback(secret);
		});
		
	};

	/**
	* add a user to the data group
	*
	* @return {Boolean} user added
	*/
	this.add = function(callback){
		if(typeof this.secret === undefined) {
			console.error('you have to set a secret before calling add');
			callback(false);
		}
		dg.put(self.name, self.secret, function(status) {
			if(status) {
				self.enrolled = true;
			}
			callback(true);
		});
	};

};

