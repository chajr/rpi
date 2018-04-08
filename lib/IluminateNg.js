// let Gpio = require('../test/GpioMock');
let Gpio = require('onoff').Gpio;
let Log = require('../lib/log');
let redis = require('../lib/redis.js');

let log = new Log();

module.exports = class IluminateNg {
    constructor(config) {
        this.pins = [
            new Gpio(config.get('illuminate_gpio.pin_1'), 'out'),
            new Gpio(config.get('illuminate_gpio.pin_2'), 'out'),
            new Gpio(config.get('illuminate_gpio.pin_3'), 'out')
        ];
        this.transmitter = config.get('illuminate_gpio.transmitter');
        this.config = config;

        redis.connect();
    }

    on (pinNumber) {
        try {
            this.pins[pinNumber -1].writeSync(1);

            redis.setData('illuminate_status_' + pinNumber, 'true');

            log.logInfo('Light turn on: ' + pinNumber, 'iluminateNg-lib', true);
        } catch(err) {
            log.logError(err.getMessage(), 'iluminateNg-lib', true);
        }
    }

    off (pinNumber) {
        if (this.transmitter === 'low') {
            this.transmitterLow (pinNumber);
        } else if (this.transmitter === 'high') {
            this.transmitterHigh (pinNumber);
        }
    }
    

    transmitterHigh (pinNumber) {
        try {
            this.pins[pinNumber -1].writeSync(0);

            redis.setData('illuminate_status_' + pinNumber, 'false');

            log.logInfo('Light turn off. Type high: ' + pinNumber, 'iluminateNg-lib', true);
        } catch(err) {
            log.logError(err.getMessage(), 'iluminateNg-lib', true);
        }
    }

    transmitterLow (pinNumber) {
        try {
            redis.setData('illuminate_status_' + pinNumber, 'false');

            new Gpio(this.config.get('illuminate_gpio.pin_' + pinNumber), 'in');

            log.logInfo('Light turn off. Type low: ' + pinNumber, 'iluminateNg-lib', true);

            this.pins[pinNumber -1].writeSync(1);
        } catch(err) {
            log.logError(err.getMessage() + '. Type low: ' + pinNumber, 'iluminateNg-lib', true);
        }
    }
};
