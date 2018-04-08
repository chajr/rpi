let Gpio = require('onoff').Gpio;
let Log = require('../lib/log');

let log = new Log();
let info = [];
let config;

exports.watcher = function (appConfig, buttonConfig, buttonCallback) {
    config = appConfig;

    let pin = createButton(buttonConfig);

    let btn = new Gpio(pin, 'in', 'both');
    btn.watch(function (err, state) {
        buttonWatcher(err, state, pin, buttonCallback);
    });
};

function createButton (name) {
    let pin = config.get(name);

    info[pin] = {
        time: 0,
        status: 0,
    };

    return pin;
}

function buttonWatcher (err, state, pin, callback) {
    if (err) {
        log.logError(err + ' State: ' + state + '. Pin: ' + pin, 'lib', true);
    }

    if(state === 1) {
        let date = new Date;
        let currentState = date.getTime();

        if (currentState < info[pin].time +500) {
            return null;
        }

        if (info[pin].status) {
            info[pin].status = 0;
        } else {
            info[pin].status = 1;
        }

        callback(info[pin].status);
        log.logInfo('Button "' + pin + '" set to: ' + !!info[pin].status, 'lib', true);

        date = new Date;
        info[pin].time = date.getTime();
    }
}
