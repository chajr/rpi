require('console.table');
var colors = require('colors');
var exec = require('sync-exec');
var redis = require('../lib/redis.js');
var config;

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
    // console.log('Disk usage: ', exec('disk_usage: \'df -h | grep ^/\'').stdout.green);
}

function getProcesses() {
    //rpias proccesses
}

function getRedisVars() {
    redis.getData('illuminate_status', function (data) {
        if (data) {
            console.log('Illuminate status: ', data.yellow);
        }
    });
    redis.getData('illuminate_force_on', function (data) {
        if (data) {
            console.log('Illuminate force on: ', data.yellow);
        }
    });
    redis.getData('illuminate_force_off', function (data) {
        if (data) {
            console.log('Illuminate force off: ', data.yellow);
        }
    });
    redis.getData('illuminate_keep_alive', function (data) {
        if (data) {
            console.log('Illuminate keep alive: ', data.yellow);
        }
    });
    redis.getData('illuminate_light_1', function (data) {
        if (data) {
            console.log('Illuminate light 1: ', data.yellow);
        }
    });
    redis.getData('illuminate_light_2', function (data) {
        if (data) {
            console.log('Illuminate light 2: ', data.yellow);
        }
    });
    redis.getData('alert_armed', function (data) {
        if (data) {
            console.log('Illuminate system armed: ', data.yellow);
        }
    });
    redis.getData('sms_send', function (data) {
        if (data) {
            console.log('Illuminate sms send: ', data.yellow);
        }
    });
    redis.getData('error_led', function (data) {
        if (data) {
            var string;

            if (data === 'false') {
                string = data.green;
            } else {
                string = data.red;
            }

            console.log('Error LED status: ', string);

            process.exit(0);
        }
    });
}

function getSusnetTime() {
    var lt = config.get('app.position.lt');
    var gt = config.get('app.position.gt');
    var date = new Date();
    var SunCalc = require('suncalc');
    var sunCalc = SunCalc.getTimes(date, lt, gt);
    var sunsetTime = sunCalc.sunset.getHours()
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
