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
                    level: 'debug'
                }),
                new (winston.transports.File)({
                    name: 'warning',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'warning.log',
                    level: 'warning'
                }),
                new (winston.transports.File)({
                    name: 'info',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'info.log',
                    level: 'info'
                }),
                new (winston.transports.File)({
                    name: 'error',
                    json: config.get('app.json_log'),
                    filename: config.get('app.log_path') + '/' + 'error.log',
                    level: 'error'
                })
            ]
        });
    }

    logger.log(level, message);
}
