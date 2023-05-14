#!/usr/bin/env node

let Config = require('./lib/config.js');
let log = require('./lib/log.js');
let redis = require('./lib/redis.js');
let fs = require('fs');
let colors = require('colors');

let app;
let config = new Config;
let args = process.argv.slice(2);
let startTime = new Date().getTime();
let path = __dirname + '/src/' + args[0];

if (fs.existsSync(path + '.js')) {
    app = require(path);
} else {
    console.log(colors.yellow('Nothing to run: ') + colors.cyan(path));
    process.exit(1);
}

args.splice(0, 1);

try {
    redis.connect();
    redis.setData('error_led', 'false');
    app.launch(args, config, startTime);
} catch (error) {
    console.log('Application error, more info in log file.');
    console.log(error);
    log.logError(error);

    redis.setData('error_led', 'true');

    process.exit(1);
}

//finally launch app error mode
