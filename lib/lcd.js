var gpio = require('onoff').Gpio;
var Lcd = require('lcd');
var config = require('./config');
var lightOn = config.get('app.light_on');
var lightPin = new gpio(config.get('alert_gpio.lcd_light'), 'out');
var lcd;

exports.init = function () {
    lcd = new Lcd({
        rs: config.get('alert_gpio.lcd_rs'),
        e: config.get('alert_gpio.e'),
        data: [
            config.get('alert_gpio.lcd_data_1'),
            config.get('alert_gpio.lcd_data_2'),
            config.get('alert_gpio.lcd_data_3'),
            config.get('alert_gpio.lcd_data_4')
        ],
        cols: config.get('lcd.cols'),
        rows: config.get('lcd.rows')
    });

    this.lightOff();
};

exports.displayMessage = function (data) {
    var step = 0;

    clear();

    for (var key in data) {
        if (step !== 0) {
            lcd.once('printed', function () {
                print(step, data[key]);
            });
        } else {
            print(step, data[key]);
        }
    }
};

exports.clear = function () {
    lcd.clear();
    lcd.close();
    this.init();
};

exports.lightOn = function () {
    if (lightOn) {
        lightPin.writeSync(1);
    }
};

exports.lightOff = function () {
    lightPin.writeSync(0);
};

function print (line, message) {
    lcd.setCursor(0, line);
    lcd.print(message);
}
