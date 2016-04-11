var gpio = require('onoff').Gpio;
var log = require('../lib/log.js');
var redis = require('../lib/redis.js');
var launched = false;

exports.launch = function (args, config) {
    var pin1 = new gpio(config.get('illuminate_gpio.pin_1'), 'out');
    var pin2 = new gpio(config.get('illuminate_gpio.pin_2'), 'out');
    var pin3 = new gpio(config.get('illuminate_gpio.pin_3'), 'out');
    var pin4 = new gpio(config.get('illuminate_gpio.pin_4'), 'out');
    var pinVal = 0;

    if (args[0] === 'on') {
        pinVal = 1;
        launched = true;
        redis.setData('illuminate_status', 'true');
    } else {
        launched = false;
        redis.setData('illuminate_status', 'false');
    }

    pin1.writeSync(pinVal);
    pin2.writeSync(pinVal);
    pin3.writeSync(pinVal);
    pin4.writeSync(pinVal);

    var message = 'Pin set to: ' + pinVal;
    console.log(message);
    log.logInfo(message);
};
