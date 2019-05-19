const {execSync} = require('child_process');
const {exec} = require('child_process');
let Log = require('../lib/log');
let worker = require('../lib/worker');
let request = require('request');
let uptime = require('../lib/uptime');

let led;
let name = 'System worker';
let config;
let buttonOff;
let Gpio;
let startTime;
let log = new Log();

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

        lcd.clear();
        lcd.displayMessage([
            'System shutdown',
            'after: ' + uptime
        ]);

        log.logInfo('System shutdown after: ' + uptime, '', true);
        console.log('System is shutting down.');

        exec(config.get('app.shutdown_command'), {}, function () {
            console.log('System off.');
        });
    }
}

function collectData() {
    let data = [];
    data['extra'] = [];
    let commands = config.get('commands');

    for (let key in commands) {
        if (key === 'extra') {
            for (let keyExtra in commands[key]) {
                let buffer = execSync(commands[key][keyExtra]);
                let output = Buffer.from(buffer);

                data['extra'][keyExtra] = output.toString();
            }

            continue;
        }

        let buffer = execSync(commands[key]);
        let output = Buffer.from(buffer);

        data[key] = output.toString();
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
