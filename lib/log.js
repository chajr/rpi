let winston = require('winston');
let Config = require('./config');

let Logger = new Log(new Config);

exports.logError = function (message, context = '') {
    Logger.log('error', message, context);
};

exports.logDebug = function (message, context = '') {
    Logger.log('debug', message, context);
};

exports.logWarning = function (message, context = '') {
    Logger.log('warning', message, context);
};

exports.logInfo = function (message, context = '') {
    Logger.log('info', message, context);
};

class Log
{
    constructor (config) {
        this.basePath = config.get('app.main_path') + '/' + config.get('app.log_path') + '/';
        this.logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'debug',
                    json: config.get('app.json_log'),
                    filename: this.basePath + 'debug_' + this.getDate() + '.log',
                    level: 'debug',
                    timestamp: () => {
                        return this.getTime();
                    }
                }),
                new (winston.transports.File)({
                    name: 'warning',
                    json: config.get('app.json_log'),
                    filename: this.basePath + 'warning_' + this.getDate() + '.log',
                    level: 'warning',
                    timestamp: () => {
                        return this.getTime();
                    }
                }),
                new (winston.transports.File)({
                    name: 'info',
                    json: config.get('app.json_log'),
                    filename: this.basePath + 'info_' + this.getDate() + '.log',
                    level: 'info',
                    timestamp: () => {
                        return this.getTime();
                    }
                }),
                new (winston.transports.File)({
                    name: 'error',
                    json: config.get('app.json_log'),
                    filename: this.basePath + 'error_' + this.getDate() + '.log',
                    level: 'error',
                    timestamp: () => {
                        return this.getTime();
                    }
                })
            ]
        });
    }

    log (level, message, context) {
        if (context !== '') {
            message = ' [' + context + '] ' + message;
        }

        this.logger.log(level, message);
    }

    static getTime () {
        let now = new Date();

        return now.getHours()
            + ':' + now.getMinutes()
            + ':' + now.getSeconds()
            + '.' + now.getMilliseconds();
    }

    static getDate () {
        let now = new Date();
        let day = ('0' + now.getDate()).slice(-2);
        let month = ('0' + (parseInt(now.getMonth()) +1)).slice(-2);

        return now.getFullYear()
            + '-' + month
            + '-' + day
    }
}
