var gpio = require('onoff').Gpio;
var ledStatus = 0;

exports.ledOn = function (pin) {
    var led = new gpio(pin, 'out');
    led.writeSync(1);
    ledStatus = 1;
};

exports.ledOff = function (pin) {
    var led = new gpio(pin, 'out');
    led.writeSync(0);
    ledStatus = 0;
};

exports.ledChangeStatus = function (pin) {
    if (ledStatus) {
        this.ledOn(pin);
    } else {
        this.ledOff(pin);
    }
};
