var gpio = require('onoff').Gpio;
var ledStatus = [];

exports.on = function (pin) {
    var led = new gpio(pin, 'out');
    led.writeSync(1);
    ledStatus[pin] = 1;
};

exports.off = function (pin) {
    var led = new gpio(pin, 'out');
    led.writeSync(0);
    ledStatus[pin] = 0;
};

exports.changeStatus = function (pin) {
    if (ledStatus) {
        this.on(pin);
    } else {
        this.off(pin);
    }
};

exports.getStatus = function (pin) {
    var status = ledStatus[pin];

    if (typeof status === 'undefined') {
        return 0;
    }

    return status;
};
