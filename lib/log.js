let winston = require('winston');
let Config = require('./config');

class Log
{
    constructor (config, level) {
        this.config = config;
        this.level = level;
        this.basePath = config.get('app.main_path') + '/' + config.get('app.log_path') + '/';
        this.logger = new (winston.Logger)({
            transports: [this.newTransport(this.level)]
        });
    }

    newTransport (type) {
        return new (winston.transports.File)({
            name: type,
            json: this.config.get('app.json_log'),
            filename: this.basePath + type + '_' + Log.getDate() + '.log',
            level: type,
            timestamp: () => {
                return Log.getTime();
            }
        });
    }

    log (message, context) {
        if (context !== '') {
            message = ' [' + context + '] ' + message;
        }

        this.logger.log(this.level, message);
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

exports.logError = function (message, context = '') {
    let Logger = new Log(new Config, 'error');
    Logger.log(message, context);
};

exports.logDebug = function (message, context = '') {
    let Logger = new Log(new Config, 'debug');
    Logger.log(message, context);
};

exports.logWarning = function (message, context = '') {
    let Logger = new Log(new Config, 'warning');
    Logger.log(message, context);
};

exports.logInfo = function (message, context = '') {
    let Logger = new Log(new Config, 'info');
    Logger.log(message, context);
};

exports.getDate = function () {
    return Log.getDate(2);
};

