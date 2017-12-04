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

    process.exit(0);
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
    // console.log('Disk usage: ', exec('disk_usage: \'df -h | grep ^/\'').stdout.green);
}

function getProcesses() {
    //rpias proccesses
}

function getRedisVars() {
    getRedisData('illuminate_status', 'Illuminate status: ');
    getRedisData('illuminate_force', 'Illuminate force: ');
    getRedisData('illuminate_minimal_time', 'Illuminate minimal time: ');
    getRedisData('illuminate_turn_on', 'Illuminate turn on: ');
    getRedisData('illuminate_shut_down_time', 'Illuminate shutdown time: ');
    getRedisData('illuminate_light_1', 'Illuminate light 1: ');
    getRedisData('illuminate_light_2', 'Illuminate light 2: ');
    getRedisData('alert_armed', 'System armed: ');
    getRedisData('sms_send', 'SMS send: ');
    getRedisData('lcd_light', 'LCD light: ');
    getRedisData('lcd_message_0', 'LCD message 0: ');
    getRedisData('lcd_message_1', 'LCD message 1: ');

    getRedisData('error_led', 'Error LED status: ', function (data) {
        if (data === 'false') {
            return data.green;
        }

        return data.red;
    });
}

function getRedisData(key, message, callback = false) {
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
