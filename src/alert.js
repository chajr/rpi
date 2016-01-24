var gpio = require('onoff').Gpio;
var lcd = require('../lib/lcd');
var led = require('../lib/led');
var log = require('../lib/log.js');
var RaspiCam = require("raspicam");
var exec = require('child_process').exec;
var startTime = new Date().getTime();
var buttonLight;
var buttonOff;
var lcdLightStatus = 0;
var config;
var detector;
var recordInterval;
var currentRecord;
var camera = false;

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();

    buttonLight.watch(lcdLight);
    buttonOff.watch(systemOff);
    detector.watch(alarm);
};

function lcdLight(err, state) {
    if(state == 1) {
        if (lcdLightStatus) {
            lcd.lightOff();
            lcdLightStatus = 0;
        } else {
            lcd.lightOn();
            lcdLightStatus = 1;
        }
    }
}

function init() {
    detector = new gpio(
        config.get('alert_gpio.detector_move'),
        'in',
        'both'
    );
    buttonLight = new gpio(
        config.get('alert_gpio.button_display'),
        'in',
        'both'
    );
    buttonOff = new gpio(
        config.get('alert_gpio.button_off'),
        'in',
        'both'
    );

    led.off(config.get('app.led_red'));
    led.on(config.get('app.led_green'));

    lcd.init();
}

function systemOff(err, state) {
    if(state == 1) {
        var uptime = upTime();
        var exec = require('child_process').exec;

        lcd.clear();
        lcd.displayMessage([
            'System shutdown',
            'after: ' + uptime
        ]);

        log.logInfo('System shutdown after: ' + uptime);
        console.log('System is shutting down.');

        exec(config.get('app.shutdown_command'));
    }
}

function upTime() {
    var currentTime = new Date().getTime();
    var calc = currentTime - startTime;
    var diff = new Date(calc);

    return (diff.getHours() -1) + ':' + diff.getMinutes() + ':' + diff.getSeconds();
}

function alarm(err, state) {
    if (err) {
        log.logError(err);
    }

    if (state == 1) {
        console.log('move detected');

        record();
        recordInterval = setInterval(
            record,
            config.get('alert_gpio.camera.timeout') + config.get('alert_gpio.camera.interval')
        );
    } else {
        if (camera) {
            camera.stop();
        }

        clearInterval(recordInterval);

        console.log('no move');
    }
}

function record() {
    if (camera) {
        camera.stop();
    }

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
        output: "var/movie/" + currentRecord,
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

function sendToRemote() {
    console.log('send file');
    exec(
        'scp var/movie/' + currentRecord + ' ' + config.get('alert_gpio.server_destination'),
        recordCallback
    );
    console.log('ended');
}
