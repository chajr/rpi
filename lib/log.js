var winston = require('winston');
var config = require('./config');
var logger = false;

exports.logError = function (message) {
    log('error', message);
};

exports.logDebug = function (message) {
    log('debug', message);
};

exports.logWarning = function (message) {
    log('warning', message);
};

exports.logInfo = function (message) {
    log('info', message);
};

function log (level, message) {
    if (!logger) {
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'debug',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'debug.log',
                    level: 'debug',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'warning',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'warning.log',
                    level: 'warning',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'info',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'info.log',
                    level: 'info',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'error',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'error.log',
                    level: 'error',
                    timestamp: function() {
                        return getDate();
                    }
                })
            ]
        });
    }

    logger.log(level, message);
}

function getDate () {
    var now = new Date();
    var day = ('0' + now.getDate()).slice(-2);
    var month = ('0' + (parseInt(now.getMonth()) +1)).slice(-2);

    return day
        + '-' + month
        + '-' + now.getFullYear()
        + ' ' + now.getHours()
        + ':' + now.getMinutes()
        + ':' + now.getSeconds()
        + '.' + now.getMilliseconds();
}
