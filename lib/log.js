require('colors');
let fs = require('fs');
let Config = require('../lib/config');

module.exports = class Log
{
    constructor () {
        this.config = new Config();
        this.basePath = this.config.get('app.main_path') + '/' + this.config.get('app.log_path') + '/';
    }

    log (message, context, level, showOutput) {
        let logName = this.basePath + level + '_' + Log.getDate() + '.log';
        let newMessage = this.buildMessage(Log.getTime(), message, context);

        Log.writeMessage(newMessage, logName);

        if (showOutput) {
            console.log(newMessage);
        }
    }

    logError (message, context, showOutput = false) {
        this.log(message, context, 'error', showOutput);
    }

    logDebug (message, context, showOutput = false) {
        this.log(message, context, 'debug', showOutput);
    }

    logWarning (message, context, showOutput = false) {
        this.log(message, context, 'warning', showOutput);
    }

    logInfo (message, context, showOutput = false) {
        this.log(message, context, 'info', showOutput);
    }

    buildMessage (time, context, message) {
        let contextVal = '';
        let app = process.argv[2];

        if (context !== '') {
            contextVal = ' - ' + context.green;
        }

        return '[' + time.yellow + ' - ' + app.yellow + contextVal + '] ' + message;
    }

    static writeMessage (message, logName) {
        try {
            fs.appendFileSync(logName, message);
        } catch (err) {
            console.log('Unable to save log information: '.red, logName, + '; ' +  message);
        }
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
};
