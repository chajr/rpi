var Gpio = require('onoff').Gpio;
var log = require('../lib/log');
var status = 0;
var time = 0;
var currentState = 0;

var callback;
var date;
var pin;

exports.watcher = function (buttonPin, buttonCallback) {
    pin = buttonPin;
    callback = buttonCallback;

    var button = new Gpio(pin, 'in', 'both');

    button.watch(watcher);
};

function watcher (err, state) {
    if (err) {
        log.logError(err + ' State: ' + state + '. Pin: ' + pin);
    }

    if(state == 1) {
        date = new Date;
        currentState = date.getTime();

        if (currentState < time +500) {
            return;
        }

        callback(status);

        if (status) {
            status = 0;
        } else {
            status = 1;
        }

        log.logInfo('Button "' + pin + '" set to: ' + status);

        date = new Date;
        time = date.getTime();
    }
}
