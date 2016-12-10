var exec = require('sync-exec');
var log = require('../lib/log');
var worker = require('../lib/worker');
var request = require('request');
var lcd = require('../lib/lcd');
var led = require('../lib/led');
var uptime = require('../lib/uptime');

var name = 'System worker';
var config;
var buttonOff;
var Gpio;
var startTime;

var commands = {
    date: 'date +"%Y-%m-%d %T"',
    cpu_utilization: 'cat /var/log/proc.log',
    memory_free: 'free | grep "Mem\\|Pamięć" | awk \'{print ($2-$3) / $2 * 100.0}\'',
    memory_used: 'free | grep "Mem\\|Pamięć" | awk \'{print $3/$2 * 100.0}\'',
    uptime_p: 'uptime -p',
    uptime_s: 'uptime -s',
    system_load: 'cat /proc/loadavg | awk \'{print $1,$2,$3}\'',
    process_number: 'ps -Af --no-headers | wc -l',
    disk_utilization: 'iostat -d /dev/sda | sed -n "4p"',
    network_utilization: 'ifstat -i enp2s0 -q 1 1 | tail -1', //enp2s0 set up in configuration
    logged_in_users: 'users',
    logged_in_users_count: 'users | wc -w',
    users_work: 'w -h',
    hostname: 'hostname',
    ip_internal: 'hostname -I | xargs -n1 | head -1',
    ip_external: 'wget http://ipinfo.io/ip -qO -',
    disk_usage: 'df -h | grep ^/'
};
var data = {};

exports.launch = function (args, appConfig, appStartTime) {
    config = appConfig;
    startTime = appStartTime;

    if (config.get('app.gpio_enabled')) {
        Gpio = require('onoff').Gpio;
    }

    init();

    buttonOff.watch(systemOff);
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
    }
}

function systemOff(err, state) {
    if (state == 1) {
        var uptime = uptime(startTime);
        var exec = require('child_process').exec;

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
    for (var key in commands) {
        data[key] = exec(commands[key]).stdout;
    }

    var url = config.get('workers.system.data_collector')
        + '?key='
        + config.get('workers.system.security_key');

    request.post(
        url,
        {form: data},
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                log.logInfo(body);
            }
        }
    );
}
