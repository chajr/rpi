require('console.table');
require('colors');
let exec = require('sync-exec');
let redis = require('../lib/redis.js');
let config;

exports.launch = function (args, appConfig) {
    config = appConfig;

    redis.connect();

    getSystemInfo();
    getProcesses();
    getSusnetTime();
    getRedisVars();
};

function execCommand(command) {
    return exec(command).stdout.replace("\n", '');
}

function getSystemInfo() {
    console.log('Current date ', execCommand('date +"%Y-%m-%d %T"').green);
    console.log('Uptime from: ', execCommand('uptime -p').green);
    console.log('Uptime on: ', execCommand('uptime -s').green);
    console.log('System Load: ', execCommand('cat /proc/loadavg | awk \'{print $1,$2,$3}\'').green);
    console.log(
        'Memory free: ',
        execCommand('free | grep "Mem\\|Pamięć" | awk \'{print ($2-$3) / $2 * 100.0}\'').green,
        '%'
    );
    console.log('CPU used: ', execCommand('cat /var/log/proc.log').green, '%');
    console.log('Opened files: ', execCommand('lsof | wc -l').green);
    console.log('Node opened files: ', execCommand('lsof | grep node | wc -l').green);
    // console.log('Disk usage: ', exec('disk_usage: \'df -h | grep ^/\'').stdout.green);
}

function getProcesses() {
    //rpias proccesses
}

function getRedisVars() {
    console.log();

    getRedisData('illuminate_status_1', 'Illuminate status 1: ');
    getRedisData('illuminate_status_2', 'Illuminate status 2: ');
    getRedisData('illuminate_status_3', 'Illuminate status 3: ');
    getRedisData('illuminate_force', 'Illuminate force: ');
    getRedisData('illuminate_minimal_time_1', 'Illuminate minimal time 1: ');
    getRedisData('illuminate_turn_on_1', 'Illuminate turn on 1: ');
    getRedisData('illuminate_shut_down_time_1', 'Illuminate shutdown time 1: ');
    getRedisData('illuminate_minimal_time_2', 'Illuminate minimal time 2: ');
    getRedisData('illuminate_turn_on_2', 'Illuminate turn on 2: ');
    getRedisData('illuminate_shut_down_time_2', 'Illuminate shutdown time 2: ');
    getRedisData('illuminate_minimal_time_3', 'Illuminate minimal time 3: ');
    getRedisData('illuminate_turn_on_3', 'Illuminate turn on 3: ');
    getRedisData('illuminate_shut_down_time_3', 'Illuminate shutdown time 3: ');
    getRedisData('illuminate_light_1', 'Illuminate light 1: ');
    getRedisData('illuminate_light_2', 'Illuminate light 2: ');
    getRedisData('illuminate_light_3', 'Illuminate light 3: ');

    getRedisData('alert_armed', 'System armed: ');
    getRedisData('sms_send', 'SMS send: ');
    getRedisData('lcd_light', 'LCD light: ');
    getRedisData('lcd_message_0', 'LCD message 0: ');
    getRedisData('lcd_message_1', 'LCD message 1: ');

    getRedisData(
        'error_led',
        'Error LED status: ',
        function (data) {
            if (data === 'false') {
                return data.green;
            }

            return data.red;
        },
        true
    );
}

function getRedisData(key, message, callback = false, exit = false) {
    redis.getData(key, function (data) {
        if (data) {
            let messageData;

            if (callback) {
                messageData = callback(data);
            } else {
                messageData = setColor(data);
            }

            console.log(message, messageData);
        }

        if (exit) {
            process.exit(0);
        }
    });
}

function setColor(message) {
    switch (message) {
        case 'true':
            return message.green;
        case 'false':
            return message.red;
        default:
            return message.yellow;
    }
}

function getSusnetTime() {
    let lt = config.get('app.position.lt');
    let gt = config.get('app.position.gt');
    let date = new Date();
    let SunCalc = require('suncalc');
    let sunCalc = SunCalc.getTimes(date, lt, gt);
    let sunsetTime = sunCalc.sunset.getHours()
        + ':'
        + sunCalc.sunset.getMinutes()
        + ':'
        + sunCalc.sunset.getSeconds()
        + ' '
        + sunCalc.sunset.getDate()
        + '-'
        + (sunCalc.sunset.getMonth() +1)
        + '-'
        + sunCalc.sunset.getFullYear();

    console.log('Sunset time for current position: ', sunsetTime.green);
}
