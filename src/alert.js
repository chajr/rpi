let Gpio = require('onoff').Gpio;
let log = require('../lib/log');
let redis = require('../lib/redis');
let fs = require('fs');
let cameraLib = require('../lib/camera');
let lcd = require('../lib/lcd');

let config;
let detector;
let recordInterval;

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();
};

function init() {
    redis.connect();

    detector = new Gpio(
        config.get('alert_gpio.detector_move'),
        'in',
        'both'
    );

    detector.watch(alarm);
}

function alarm(err, state) {
    if (err) {
        log.logError(err);
    }

    if (state === 1) {
        redis.getData('alert_armed', function (data) {
            if (data === 'true') {
                log.logInfo('Move detected.');

                if (config.get('alert_gpio.mode') === 'movie') {
                    record();
                    recordInterval = setInterval(
                        record,
                        config.get('alert_gpio.camera.timeout') + config.get('alert_gpio.camera.interval')
                    );
                }

                if (config.get('alert_gpio.mode') === 'image') {
                    cameraLib.picture(config);
                }
            }
        });
    } else {
        log.logInfo('No move detected.');
        cameraLib.cameraStop();

        if (config.get('alert_gpio.mode') === 'movie') {
            clearInterval(recordInterval);
        }
    }
}

function record() {
    cameraLib.record();
}
