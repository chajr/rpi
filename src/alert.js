var Gpio = require('onoff').Gpio;
var led = require('../lib/led');
var Button = require('../lib/button');
var log = require('../lib/log');
var redis = require('../lib/redis');
var fs = require('fs');
var request = require('request');
var cameraLib = require('../lib/camera');
var lcd = require('../lib/lcd');
var isSystemArmed;

var config;
var detector;
var recordInterval;

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

    Button.watcher(
        config.get('alert_gpio.button_armed'),
        function (status) {
            if (isSystemArmed && status == 0) {
                redis.setData('alert_armed', 'false');
                log.logInfo('Alert turn off.');
                led.off(config.get('alert_gpio.arm_led'));
                isSystemArmed = false;
            } else if (!isSystemArmed && status == 1) {
                setTimeout(
                    function() {
                        redis.setData('alert_armed', 'true');
                        log.logInfo('Alert turn on.');
                        led.on(config.get('alert_gpio.arm_led'));
                        isSystemArmed = true;
                    },
                    config.get('alert_gpio.arm_after')
                );
            }
        }
    );

    detector.watch(alarm);
    redis.getData('alert_armed', function (val) {
        isSystemArmed = val === 'true';
        console.log('redis status ' + isSystemArmed);
    });
}

function alarm(err, state) {
    if (err) {
        log.logError(err);
    }

    redis.getData('alert_armed', function (data) {
        if (data) {
            log.logInfo('Armed status: ' + data);

            isSystemArmed = data === 'true';
        }
    });

    if (state == 1 && isSystemArmed) {
        console.log('move detected');

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

    } else {
        cameraLib.cameraStop();

        if (config.get('alert_gpio.mode') === 'movie') {
            clearInterval(recordInterval);
        }

        console.log('no move');
    }
}

function record() {
    cameraLib.record();
}
