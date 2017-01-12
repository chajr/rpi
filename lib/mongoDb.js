var log = require('./log');
var config = require('./config');
var mongo = require('mongodb').MongoClient;

exports.execute = function (callback) {
    var host = config.get('connections.mongo_db.host');
    var port = config.get('connections.mongo_db.port');
    var db = config.get('connections.mongo_db.db');
    var url = 'mongodb://' + host + ':' + port + '/' + db;

    mongo.connect(url, function(err, dbObject) {
        if (err) {
            var message = 'Connection error: ' + err.message;

            console.log(message);
            log.logError(message);
        } else {
            callback(dbObject);
        }

        dbObject.close();
    });
};
