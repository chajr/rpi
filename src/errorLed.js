let log = require('../lib/log');
let worker = require('../lib/worker');
let redis = require('../lib/redis.js');

let name = 'LED status worker';
let errorLedStatus = false;

let config;
let led;

exports.launch = function (args, appConfig, appStartTime) {
    config = appConfig;

    redis.connect();

    init();
};

function init() {
    if (config.get('app.gpio_enabled')) {
        led = require('../lib/led');
        led.on(config.get('app.led_green'));
    }

    worker.startWorker(
        handleLed,
        config.get('workers.error_led.worker_time'),
        name
    );
}

function handleLed() {
    redis.getData('error_led', function (data) {
        if (data) {
            let oldLedStatus = errorLedStatus;

            errorLedStatus = data === 'true';

            if (errorLedStatus !== oldLedStatus) {
                console.log('Error LED status changed to: ' + data);

                changeStatus();
            }
        }
    });
}

function changeStatus() {
    if (config.get('app.gpio_enabled')) {
        if (errorLedStatus) {
            led.on(config.get('app.led_red'));
            led.off(config.get('app.led_green'));
        } else {
            led.off(config.get('app.led_red'));
            led.on(config.get('app.led_green'));
        }
    }
}
