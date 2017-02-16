let redis = require('redis');
let config = require('./config');
let log = require('./log');
let exec = require('sync-exec');

let mainKey = 'rpia_';

let connector;

exports.connect = function () {
    if (!connector) {
        connector = redis.createClient({
            "port": config.get('connections.redis.port'),
            "host": config.get('connections.redis.host'),
            "password": config.get('connections.redis.password')
        });
    }

    connector.on("error", function (err) {
        log.logError(err);
    });
};

exports.getMultipleData = function (keys, callback) {
    
    //implement full handle
    
    connector.mget(mainKey + key, function (err, reply) {
        callback(reply.toString());
    });
};

exports.getData = function (key, callback) {
    connector.get(mainKey + key, function (err, reply) {
        if (reply) {
            callback(reply.toString());
        } else {
            callback('null');
        }
    });
};

exports.setData = function (key, val, time = null) {
    let keyName = mainKey + key;

    if (time === null) {
        connector.set(keyName, val);
    } else {
        let output = exec('redis-cli set ' + keyName + ' "' + val + '" EX ' + time).stdout;
        log.logInfo('Set timed message: ' + output);
    }
};

exports.dropData = function (key) {
    connector.del(mainKey + key);
};

exports.clearData = function (key) {
    connector.set(mainKey + key, '');
};

exports.getRedis = function () {
    return connector;
};
