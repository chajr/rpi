#!/usr/bin/env node

var config = require('./lib/config');
var log = require('./lib/log.js');
var redis = require('./lib/redis.js');

var args = process.argv.slice(2);
var startTime = new Date().getTime();
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

    case 'info':
        app = require('./src/info');
        break;

    case 'display':
        app = require('./src/display');
        break;

    case 'picture':
        app = require('./src/picture');
        break;

    case 'errorLed':
        app = require('./src/errorLed');
        break;

    default:
        console.log('nothing to run');
        process.exit(0);
        break;
}

args.splice(0, 1);

try {
    redis.connect();
    redis.setData('error_led', 'false');
    app.launch(args, config, startTime);
    // process.exit(0);
} catch (error) {
    console.log('Application error, more info in log file.');
    console.log(error);
    log.logError(error);

    redis.setData('error_led', 'true');

    process.exit(1);
}
