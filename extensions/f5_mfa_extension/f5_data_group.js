var iControl = require('icontrol');

// set API connection and authentication
var bigip = new iControl({
  host: '127.0.0.1',
  proto: 'https',
  port: '443',
  username: 'admin',
  pass: 'admin',
  strict: 'true',
  debug: 'true'
});

var exports = module.exports = {};

//ignore self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * search through data group for key
 *
 * @param {String} key
 * @return {String} data
 */
exports.get = function(key, callback) {
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
  bigip.list('/ltm/data-group/internal/~Common~token_keys', function(err, res) {
    callback(res);
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
      bigip.modify('/ltm/data-group/internal/~Common~token_keys', args, function(err, res) {
        callback(data);
      });
    });
};
