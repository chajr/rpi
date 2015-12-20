var winston = require('winston');
var config = require('./config');

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
    winston.add(
        winston.transports.File,
        {
            filename: config.get('app.log_path') + '/' + level + '.log'
        }
    );

    winston.log(level, message);
}
