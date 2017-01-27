var lcd = require('../lib/lcd');
var Gpio = require('onoff').Gpio;
var log = require('../lib/log');

var lcdLightStatus = 0;
var buttonLight;
var config;

/**
 * @todo show working time
 * @todo show last record status and time
 * @todo disk usage
 */

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();
};

function init() {
    if (buttonLight) {
        buttonLight.unwatch();
    }

    buttonLight = new Gpio(
        config.get('alert_gpio.button_display'),
        'in',
        'both'
    );

    buttonLight.watch(lcdLight);
}

function lcdLight(err, state) {
    if (err) {
        log.logError('Button LCD light error: ' + err);
    }

    if(state == 1) {
        if (lcdLightStatus) {
            lcd.lightOff();
            lcdLightStatus = 0;
        } else {
            lcd.lightOn();
            lcdLightStatus = 1;
        }
    }

    init();
}
