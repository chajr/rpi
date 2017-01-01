var log = require('./log');
var mongo = require('mongodb').MongoClient;

exports.execute = function (callback) {
    var url = 'mongodb://localhost:27017/rpias';

    mongo.connect(url, function(err, dbObject) {
        if (err) {
            var message = 'Connection error: ' + err.message;

            console.log(message);
            log.error(message);
        } else {
            callback(dbObject);
        }

        dbObject.close();
    });
};
