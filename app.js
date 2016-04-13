var config = require('./lib/config');
var log = require('./lib/log.js');
var led = require('./lib/led');

var args = process.argv.slice(2);
var app;

switch (args[0]) {
    case 'illuminate':
        app = require('./src/illuminate');
        break;

    case 'alarm':
        app = require('./src/alert');
        break;

    case 'system':
        app = require('./src/system');
        break;

    case 'autoIlluminate':
        app = require('./src/autoIlluminate');
        break;

    case 'command':
        app = require('./src/commandConsummer');
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

    led.on(config.get('app.led_red'));
    led.off(config.get('app.led_green'));

    process.exit(1);
}
