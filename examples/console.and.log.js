var winston = require('winston');

winston.add(winston.transports.File, { filename: 'somefile.log' });


winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');

winston.level = 'debug';
winston.log('debug', 'Now my debug messages are written to console!');


var exec = require('child_process').exec;
function puts(error, stdout, stderr) {
    console.log(stdout)
}
exec("ls -la", puts);