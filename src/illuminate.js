var Gpio = require('onoff').Gpio;
var log = require('../lib/log.js');
var redis = require('../lib/redis.js');
var led = require('../lib/led');
var launched = false;

exports.launch = function (args, config) {
    if (config.get('illuminate') === 'old') {
        oldIlluminate(args, config);
    } else {
        newIlluminate(args, config);
    }
};

function oldIlluminate(args, config) {
    var pin1 = new Gpio(config.get('illuminate_gpio.pin_1'), 'out');
    var pin2 = new Gpio(config.get('illuminate_gpio.pin_2'), 'out');
    var pin3 = new Gpio(config.get('illuminate_gpio.pin_3'), 'out');
    var pin4 = new Gpio(config.get('illuminate_gpio.pin_4'), 'out');
    var pinVal = 0;

    redis.connect();

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
}

function newIlluminate(args, config) {
    var pin1 = new Gpio(config.get('illuminate_gpio.pin_1'), 'out');
    var pin2 = new Gpio(config.get('illuminate_gpio.pin_2'), 'out');

    redis.connect();

    if (args[0] === 'on') {
        try {
            pin1.writeSync(1);
            pin2.writeSync(1);
            console.log(led);

            launched = true;
            redis.setData('illuminate_status', 'true');
        } catch(err) {}
    } else {
        var transmitter = config.get('illuminate_gpio.transmitter');

        if (transmitter === 'low') {
            try {
                launched = false;
                redis.setData('illuminate_status', 'false');

                new Gpio(config.get('illuminate_gpio.pin_1'), 'in');
                new Gpio(config.get('illuminate_gpio.pin_2'), 'in');

                pin1.writeSync(1);
                pin2.writeSync(1);
                console.log(led);
            } catch(err) {}
        } else if (transmitter === 'high') {
            pin1.writeSync(0);
            pin2.writeSync(0);
            console.log(led);

            launched = true;
            redis.setData('illuminate_status', 'false');
        }
    }
}
