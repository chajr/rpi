let winston = require('winston');
let Config = require('./config');
let logger = false;

let config = new Config;

exports.logError = function (message, context = '') {
    log('error', message, context);
};

exports.logDebug = function (message, context = '') {
    log('debug', message, context);
};

exports.logWarning = function (message, context = '') {
    log('warning', message, context);
};

exports.logInfo = function (message, context = '') {
    log('info', message, context);
};

function log (level, message, context) {
    if (!logger) {
        let basePath = config.get('app.main_path') + '/' + config.get('app.log_path') + '/';

        if (context !== '') {
            message = ' [' + context + '] ' + message;
        }

        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'debug',
                    json: config.get('app.json_log'),
                    filename: basePath + 'debug.log',
                    level: 'debug',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'warning',
                    json: config.get('app.json_log'),
                    filename: basePath + 'warning.log',
                    level: 'warning',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'info',
                    json: config.get('app.json_log'),
                    filename: basePath + 'info.log',
                    level: 'info',
                    timestamp: function() {
                        return getDate();
                    }
                }),
                new (winston.transports.File)({
                    name: 'error',
                    json: config.get('app.json_log'),
                    filename: basePath + 'error.log',
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
    let now = new Date();
    let day = ('0' + now.getDate()).slice(-2);
    let month = ('0' + (parseInt(now.getMonth()) +1)).slice(-2);

    return now.getFullYear()
        + '-' + month
        + '-' + day
        + ' ' + now.getHours()
        + ':' + now.getMinutes()
        + ':' + now.getSeconds()
        + '.' + now.getMilliseconds();
}
