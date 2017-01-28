var gpio = require('onoff').Gpio;
var Lcd = require('lcd');
var config = require('./config');
var lightOn = config.get('app.light_on');
var lightPin = new gpio(config.get('alert_gpio.lcd_light'), 'out');
var log = require('../lib/log');
var lcd;

exports.init = function () {
    lcd = new Lcd({
        rs: config.get('alert_gpio.lcd_rs'),
        e: config.get('alert_gpio.lcd_e'),
        data: [
            config.get('alert_gpio.lcd_data_1'),
            config.get('alert_gpio.lcd_data_2'),
            config.get('alert_gpio.lcd_data_3'),
            config.get('alert_gpio.lcd_data_4')
        ],
        cols: config.get('alert_gpio.lcd_cols'),
        rows: config.get('alert_gpio.lcd_rows')
    });

    this.lightOff();
};

exports.displayMessage = function (data) {
    lcd.on('ready', function() {
        for (var key in data) {

            if (key !== '0') {
                lcd.once('printed', function () {
                    print(key, data[key]);
                });
            } else {
                print(key, data[key]);
            }

        }
    });
};

exports.clear = function () {
    lcd.clear();
    lcd.close();
    this.init();
};

exports.lightOn = function () {
    if (lightOn) {
        lightPin.writeSync(1);
        log.logInfo('LCD light on');
    }
};

exports.lightOff = function () {
    lightPin.writeSync(0);
    log.logInfo('LCD light off');
};

function print (line, message) {
    lcd.setCursor(0, line);
    lcd.print(message);
}
