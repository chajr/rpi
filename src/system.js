let exec = require('sync-exec');
let log = require('../lib/log');
let worker = require('../lib/worker');
let request = require('request');
let uptime = require('../lib/uptime');

let led;
let name = 'System worker';
let config;
let buttonOff;
let Gpio;
let startTime;

exports.launch = function (args, appConfig, appStartTime) {
    config = appConfig;
    startTime = appStartTime;

    if (config.get('app.gpio_enabled')) {
        led = require('../lib/led');
        Gpio = require('onoff').Gpio;
    }

    init();
};

function init() {
    worker.startWorker(
        collectData,
        config.get('workers.system.worker_time'),
        name
    );

    if (config.get('app.gpio_enabled')) {
        buttonOff = new Gpio(
            config.get('alert_gpio.button_off'),
            'in',
            'both'
        );

        led.off(config.get('app.led_red'));
        led.on(config.get('app.led_green'));
        buttonOff.watch(systemOff);
    }
}

function systemOff(err, state) {
    if (state === 1) {
        let lcd = require('../lib/lcd');
        let uptime = uptime(startTime);
        let exec = require('child_process').exec;

        lcd.clear();
        lcd.displayMessage([
            'System shutdown',
            'after: ' + uptime
        ]);

        log.logInfo('System shutdown after: ' + uptime);
        console.log('System is shutting down.');

        exec(config.get('app.shutdown_command'));
    }
}

function collectData() {
    let data = [];
    data['extra'] = [];
    let commands = config.get('commands');

    for (let key in commands) {
        if (key === 'extra') {
            for (let keyExtra in commands[key]) {
                data['extra'][keyExtra] = exec(commands[key][keyExtra]).stdout;
            }

            continue;
        }

        data[key] = exec(commands[key]).stdout;
    }

    let url = config.get('workers.system.data_collector')
        + '?key='
        + config.get('auth.security_key');

    request.post(
        url,
        {
            form: data,
            auth: {
                user: config.get('auth.user'),
                pass: config.get('auth.pass')
            }
        },
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                log.logInfo(body);
            }
        }
    );
}
