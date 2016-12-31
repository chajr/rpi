var log = require('../lib/log');
var worker = require('../lib/worker');
var led = require('../lib/led');
var redis = require('../lib/redis.js');

var name = 'LED status worker';
var config;
var startTime;

exports.launch = function (args, appConfig, appStartTime) {
    config = appConfig;
    startTime = appStartTime;

    redis.connect();

    init();
};

function init() {
    worker.startWorker(
        handleLed,
        config.get('workers.error_led.worker_time'),
        name
    );
}

function handleLed() {
    redis.getData('error_led', function (data) {
        if (data) {

        }
    });
}
