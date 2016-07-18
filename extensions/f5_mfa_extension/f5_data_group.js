var Client = require('node-rest-client').Client;

var exports = module.exports = {};

// set BIG-IP specific variables
var getURI = "https://127.0.0.1/mgmt/tm/ltm/data-group/internal/~Common~token_keys"; //on box
//var getURI = "https://10.128.1.128/mgmt/tm/ltm/data-group/internal/~Common~google_auth_keys";

//ignore self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// set API authentication 
var options_auth = {
	user: "admin", 
	password: "admin"
};

/**
 * handle API GET requets
 *
 * @param {String} url
 * @param {Ojbect} args
 * @param {Function} callback
 */
exports.get = function(url, args, callback) {
  var client = new Client(options_auth);
  client.get(url, args, function(data, response) {
      callback(data);
  }).on('error', function (err) {
    console.log('something went wrong on the request', err.request.options);
  });

  client.on('error', function (err) {
      console.error('Something went wrong on the client', err);
  });
};

/**
 * search through data group for key
 *
 * @param {String} key
 * @return {String} data
 */
exports.getData = function(key, callback) {
  exports.getDataGroup(function(data) {
    if(typeof data === undefined) {
      console.error("no data group returned");
      callback(undefined);
      return;
    }
      for (var record in data.records) {
        if (data.records[record].name == key) {
          callback(data.records[record].data);
          return;
        }
      }
      // no user found
      console.log('no user found in data group');
      callback(undefined);
    });
};

/**
 * return dta group
 *
 * @param {Function} callback
 */
exports.getDataGroup = function(callback) {
  exports.get(getURI, "", function (res) {
      callback(res);
      //return res;
    });
};

/**
 * add key:data pair to the data group
 *
 * @param {String} key
 * @param {String} data
 * @param {Function} callback
 */
exports.put = function (key, data, callback) {
  exports.getDataGroup(function(res) {
      // add new user to the object stack
      // make sure the data group isn't empty
      if (typeof res.records !== 'undefined') {
        // make sure user doesn't already exist
        var isset = false;
        for(var record in res.records) {
          if(res.records[record].name == key) {
            // user exists, update secret
            res.records[record].data = data;
            isset = true;
            break;
          }
        }
        if(!isset) {
          // user doesn't exist, add them
          res.records.push({"name": key, "data": data});
        }
      } else {
        res.records = [{"name": key, "data": data}];
      }
      // populate the arguments for the http post 
      args = {  
        data: { records: res.records },
        header: { "Content-Type": "application/json" }
      };
      exports.putRequest(getURI, args, function (r) {
        callback(r);
      });
    });
};
 
/**
 * send PUT request to data group API
 *
 * @param {String} url
 * @param {Array} args
 * @param {Function} callback
 */ 
exports.putRequest = function(url, args, callback) {
	var client = new Client(options_auth);
  var req = client.put(url, args, function(data, response) {
    callback(data);
  });
  req.on('requestTimeout', function (req) {
  	console.log('request has expired');
  });
  req.on('responseTimeout', function (res) {
  	console.log('response has expired');
  });
  req.on('error', function(err) {
  	console.log('request error', err);
  });
};

