var winston = require('winston');

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
            filename: '../var/log/' + level + '.log'
        }
    );

    winston.log(level, message);
}
