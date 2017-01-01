var log = require('../lib/log');
var worker = require('../lib/worker');
var redis = require('../lib/redis.js');

var name = 'LED status worker';
var config;
var led;
var errorLedStatus = false;

exports.launch = function (args, appConfig, appStartTime) {
    config = appConfig;

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
            var oldLedStatus = errorLedStatus;

            errorLedStatus = data === 'true';

            if (errorLedStatus !== oldLedStatus) {
                console.log('Error LED status changed to: ' + data);
            }
        }
    });

    if (config.get('app.gpio_enabled')) {
        var led = require('../lib/led');

        if (errorLedStatus) {
            led.on(config.get('app.led_red'));
            led.off(config.get('app.led_green'));
        } else {
            led.off(config.get('app.led_red'));
            led.on(config.get('app.led_green'));
        }
    }
}
