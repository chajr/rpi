let log = require('../lib/log');
let worker = require('../lib/worker');
let redis = require('../lib/redis.js');

let name = 'LED status worker';
let errorLedStatus = false;
let armLedStatus = false;

let config;
let led;

exports.launch = function (args, appConfig) {
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
                log.logInfo('Error LED status changed to: ' + data);

                changeStatus(config.get('app.led_red'), errorLedStatus);
                changeStatus(config.get('app.led_green'), !errorLedStatus);
            }
        }
    });

    redis.getData('arm_led', function (data) {
        if (data) {
            let oldArmLedStatus = armLedStatus;

            armLedStatus = data === 'true';

            if (armLedStatus !== oldArmLedStatus) {
                log.logInfo('Arm LED status changed to: ' + data);

                changeStatus(config.get('alert_gpio.arm_led'), armLedStatus);
            }
        }
    });
}

function changeStatus(pin, status) {
    if (config.get('app.gpio_enabled')) {
        if (status) {
            led.on(pin);
        } else {
            led.off(pin);
        }
    }
}
