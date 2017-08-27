let Gpio = require('onoff').Gpio;
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let led = require('../lib/led');
let launched = false;


module.exports = class Iluminator {
    constructor(config) {
        //new gpio
    }
}

exports.launch = function (args, config) {
    let transmitter = config.get('illuminate_gpio.transmitter');

    if (transmitter === 'low') {
        let pin1 = new Gpio(config.get('illuminate_gpio.pin_1'), 'out');
        let pin2 = new Gpio(config.get('illuminate_gpio.pin_2'), 'out');
    } else if (transmitter === 'high') {
        new Gpio(config.get('illuminate_gpio.pin_1'), 'in');
        new Gpio(config.get('illuminate_gpio.pin_2'), 'in');
    }

    redis.connect();

    if (args[0] === 'on') {
        try {
            pin1.writeSync(1);
            pin2.writeSync(1);
            console.log(led);

            launched = true;
            redis.setData('illuminate_status', 'true');

            log.logInfo('Light turn on.');
        } catch(err) {
            log.logError(err.getMessage());
        }
    } else {
        

        
            // try {
            //     launched = false;
            //     redis.setData('illuminate_status', 'false');
            //
            //     new Gpio(config.get('illuminate_gpio.pin_1'), 'in');
            //     new Gpio(config.get('illuminate_gpio.pin_2'), 'in');
            //
            //     console.log(led);
            //     log.logInfo('Light turn off. Type low.');
            //
            //     pin1.writeSync(1);
            //     pin2.writeSync(1);
            // } catch(err) {
            //     log.logError(err.getMessage() + '. Type low.');
            // }
        
        
        //high
            // pin1.writeSync(0);
            // pin2.writeSync(0);
            // console.log(led);
            //
            // launched = true;
            // redis.setData('illuminate_status', 'false');
            //
            // log.logInfo('Light turn off. Type high.');
        // }
    }
};
