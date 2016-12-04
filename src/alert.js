var Gpio = require('onoff').Gpio;
var led = require('../lib/led');
var log = require('../lib/log.js');
var redis = require('../lib/redis.js');
var RaspiCam = require("raspicam");
var fs = require('fs');
var request = require('request');
var exec = require('child_process').exec;
var systemArmed;
var config;
var detector;
var recordInterval;
var currentRecord = false;
var camera = false;
var isSystemArmed = false;

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();

    systemArmed.watch(amrSystem);
    detector.watch(alarm);
};


function init() {
    detector = new Gpio(
        config.get('alert_gpio.detector_move'),
        'in',
        'both'
    );

    systemArmed = new Gpio(
        config.get('alert_gpio.button_armed'),
        'in',
        'both'
    );

    led.off(config.get('app.led_red'));
    led.on(config.get('app.led_green'));

    redis.connect();
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
            var time = new Date();
            currentRecord = time.toLocaleTimeString() + '_' + time.toLocaleDateString();

            var output = config.get('app.img_path')
                + '/'
                + currentRecord
                + "_%06d."
                + config.get('alert_gpio.image.encoding');

            camera = new RaspiCam({
                mode: "timelapse",
                output: output,
                encoding: config.get('alert_gpio.image.encoding'),
                width: config.get('alert_gpio.image.width'),
                height: config.get('alert_gpio.image.height'),
                timelapse: config.get('alert_gpio.image.timelapse'),
                timeout: config.get('alert_gpio.image.timeout')
            });

            if (config.get('app.image_send')) {
                camera.on("read", function (err, timestamp, filename) {
                    if (!filename.match(
                        /^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}_[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}_[0-9]+\.jpg~$/)
                    ) {
                        var formData = {
                            file: fs.createReadStream(config.get('app.img_path') + '/' + filename)
                        };

                        var url = config.get('alert_gpio.server_destination')
                            + '?key='
                            + config.get('app.security_key');

                        request.post(
                            {
                                url: url,
                                formData: formData
                            },
                            function optionalCallback(err, httpResponse, body) {
                                if (err) {
                                    return console.error('upload failed:', err);
                                }

                                console.log('Upload successful!  Server responded with:', body);
                            }
                        );
                    }
                });
            }

            camera.start();
        }

    } else {
        cameraStop();

        if (config.get('alert_gpio.mode') === 'movie') {
            clearInterval(recordInterval);
        }

        console.log('no move');
    }
}

function record() {
    cameraStop();

    console.log('start record');
    var time = new Date();
    currentRecord = time.getHours()
        + ':'
        + time.getMinutes()
        + ':'
        + time.getSeconds()
        + '_'
        + time.getDate()
        + '-'
        + (time.getMonth() +1)
        + '-'
        + time.getFullYear()
        + '.avi';

    camera = new RaspiCam({
        mode: "video",
        output: config.get('app.movie_path') + '/' + currentRecord,
        timeout: config.get('alert_gpio.camera.timeout'),
        width: config.get('alert_gpio.camera.width'),
        height: config.get('alert_gpio.camera.height'),
        bitrate: config.get('alert_gpio.camera.bitrate'),
        framerate: config.get('alert_gpio.camera.framerate')
    });

    camera.start();

    console.log('record started');
}

function recordCallback(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    console.log(error);
}

function cameraStop() {
    if (camera) {
        camera.stop();

        if (config.get('alert_gpio.mode') === 'movie') {
            sendToRemote();
        }
    }
}

function sendToRemote() {
    if (currentRecord && config.get('app.movie_send')) {
        console.log('send file');
        var command = 'scp '
            + config.get('app.movie_path')
            + '/'
            + currentRecord
            + ' '
            + config.get('alert_gpio.server_destination');

        exec(command, recordCallback);

        console.log('ended');
        currentRecord = false;
    }
}

function amrSystem(err, state) {
    if (isSystemArmed && state == 0) {
        redis.setData('alert_armed', 'false');
        log.logInfo('Alert turn off.');
        led.off(config.get('alert_gpio.arm_led'));
        isSystemArmed = false;
    } else if (!isSystemArmed && state == 1) {
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
