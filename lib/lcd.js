var gpio = require('onoff').Gpio;
var Lcd = require('lcd');
var config = require('./config');
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
};

exports.displayMessage = function (message, row) {
    
};

exports.clear = function () {
    lcd.clear();
};

exports.lightOn = function () {
    
};

exports.lightOff = function () {
    
};
