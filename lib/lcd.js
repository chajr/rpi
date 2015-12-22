var gpio = require('onoff').Gpio;
var Lcd = require('lcd');
var config = require('./config');
var lightOn = config.get('app.light_on');
var lightPin = config.get('alert_gpio.lcd_light');
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
    var self = this;
    
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
