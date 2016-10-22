var redis = require('redis');
var config = require('./config');
var log = require('./log');
var connector;

exports.connect = function () {
    if (!connector) {
        connector = redis.createClient({
            "port": config.get('connections.redis.port'),
            "host": config.get('connections.redis.host'),
            "password": config.get('connections.redis.password')
        });
    }

    connector.on("error", function (err) {
        log.logError("Redis connection error:  " + err);
    });
};

exports.getMultipleData = function (keys, callback) {
    connector.mget('rpia_' + key, function (err, reply) {
        callback(reply.toString());
    });
};

exports.getData = function (key, callback) {
    connector.get('rpia_' + key, function (err, reply) {
        callback(reply.toString());
    });
};

exports.setData = function (key, val) {
    connector.set('rpia_' + key, val);
};

exports.dropData = function (key) {
    connector.del('rpia_' + key);
};

exports.clearData = function (key) {
    connector.set('rpia_' + key, '');
};

exports.getRedis = function () {
    return connector;
};
