var config = require('./lib/config');
var log = require('./lib/log.js');

var args = process.argv.slice(2);
var app;

switch (args[0]) {
    case 'illuminate':
        app = require('./src/illuminate');
        break;

    case 'alarm':
        console.log('not supported yet');
        process.exit(1);
        break;

    default:
        console.log('nothing to run');
        process.exit(0);
        break;
}

args.splice(0, 1);

try {
    app.launch(args, config);
} catch (error) {
    console.log('Application error, more info in log file.');
    log.logError(error);
    process.exit(1);
}
