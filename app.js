#!/usr/bin/env node

var config = require('./lib/config');
var log = require('./lib/log.js');
var redis = require('./lib/redis.js');
var fs = require('fs');

var args = process.argv.slice(2);
var startTime = new Date().getTime();
var app;

if (fs.existsSync(config.get('app.main_path') + '/src/' + args[0] + '.js')) {
    app = require(config.get('app.main_path') + '/src/' + args[0]);
} else {
    console.log('nothing to run');
    process.exit(1);
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
