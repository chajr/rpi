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

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();
    lcd.init();

    buttonLight.watch(lcdLight);
    buttonOff.watch(systemOff);
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
