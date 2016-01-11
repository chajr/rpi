var gpio = require('onoff').Gpio;
var lcd = require('../lib/lcd');
var led = require('../lib/led');
var log = require('../lib/log.js');
var startTime = new Date().getTime();
var buttonLight;
var buttonOff;
var buttonStatus;
var lcdLightStatus = 0;
var config;
var detector;

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
    detector = new gpio(
        config.get('alert_gpio.detector_move'),
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

        exec('sudo shutdown -h now');
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
        var cameraExec = config.get('alert_gpio.camera_exec');
        var time = new Date();
        var command = cameraExec + time.getTime() + '.avi';
        var exec = require('child_process').exec;

        function puts(error, stdout, stderr) {
            
        }

        exec(command, puts);

    } else {
        console.log('no move');
        console.log("\n");
    }
}
