let Gpio = require('onoff').Gpio;
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');

module.exports = class IluminateNg {
    constructor(config) {
        this.pin1 = new Gpio(config.get('illuminate_gpio.pin_1'), 'out');
        this.pin2 = new Gpio(config.get('illuminate_gpio.pin_2'), 'out');
        this.transmitter = config.get('illuminate_gpio.transmitter');
        this.config = config;

        redis.connect();
    }

    light (type) {
        if (type === 'on') {
            this.on();
        } else {
            this.off();
        }
    }

    on () {
        try {
            this.pin1.writeSync(1);
            this.pin2.writeSync(1);

            redis.setData('illuminate_status', 'true');

            log.logInfo('Light turn on.');
        } catch(err) {
            log.logError(err.getMessage());
        }
    }

    off () {
        if (this.transmitter === 'low') {
            this.transmitterLow ();
        } else if (this.transmitter === 'high') {
            this.transmitterHigh ();
        }
    }

    transmitterHigh () {
        try {
            this.pin1.writeSync(0);
            this.pin2.writeSync(0);

            redis.setData('illuminate_status', 'false');

            log.logInfo('Light turn off. Type high.');
        } catch(err) {
            log.logError(err.getMessage());
        }
    }

    transmitterLow () {
        try {
            redis.setData('illuminate_status', 'false');

            new Gpio(this.config.get('illuminate_gpio.pin_1'), 'in');
            new Gpio(this.config.get('illuminate_gpio.pin_2'), 'in');

            log.logInfo('Light turn off. Type low.');

            this.pin1.writeSync(1);
            this.pin2.writeSync(1);
        } catch(err) {
            log.logError(err.getMessage() + '. Type low.');
        }
    }
};
