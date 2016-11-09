var exec = require('sync-exec');
var log = require('../lib/log');
var worker = require('../lib/worker');
var request = require('request');
var lcd = require('../lib/lcd');
var Gpio = require('onoff').Gpio;
var config;
var buttonOff;
var name = 'System worker';

var commands = {
    date: 'date +"%Y-%m-%d %T"',
    cpu_utilization: 'cat /var/log/proc.log',
    memory_free: 'free | grep "Mem\\|Pamięć" | awk \'{print $4/$2 * 100.0}\'',
    memory_used: 'free | grep "Mem\\|Pamięć" | awk \'{print $3/$2 * 100.0}\'',
    uptime_p: 'uptime -p',
    uptime_s: 'uptime -s',
    system_load: 'cat /proc/loadavg | awk \'{print $1,$2,$3}\'',
    process_number: 'ps -Af --no-headers | wc -l',
    disk_utilization: 'iostat -d /dev/sda | sed -n "4p"',
    network_utilization: 'ifstat -i eth0 -q 1 1 | tail -1',
    logged_in_users: 'users',
    logged_in_users_count: 'users | wc -w',
    users_work: 'w -h',
    hostname: 'hostname',
    ip_internal: 'hostname -I | xargs -n1 | head -1',
    ip_external: 'wget http://ipinfo.io/ip -qO -',
    disk_usage: 'df -h | grep ^/'
};
var data = {};

exports.launch = function (args, appConfig) {
    config = appConfig;

    init();

    buttonOff.watch(systemOff);
};

function init() {
    worker.startWorker(
        collectData,
        config.get('workers.system.worker_time'),
        name
    );

    buttonOff = new Gpio(
        config.get('alert_gpio.button_off'),
        'in',
        'both'
    );
}

function systemOff(err, state) {
    if(state == 1) {
        var uptime = upTime();
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
