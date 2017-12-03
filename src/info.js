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
    redis.getData('illuminate_force', function (data) {
        if (data) {
            console.log('Illuminate force: ', data.yellow);
        }
    });
    redis.getData('illuminate_minimal_time', function (data) {
        if (data) {
            console.log('Illuminate minimal time: ', data.yellow);
        }
    });
    redis.getData('illuminate_turn_on', function (data) {
        if (data) {
            console.log('Illuminate turn on: ', data.yellow);
        }
    });
    redis.getData('illuminate_shut_down_time', function (data) {
        if (data) {
            console.log('Illuminate shutdown time: ', data.yellow);
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
            console.log('System armed: ', data.yellow);
        }
    });
    redis.getData('sms_send', function (data) {
        if (data) {
            console.log('SMS send: ', data.yellow);
        }
    });
    redis.getData('lcd_light', function (data) {
        if (data) {
            console.log('LCD light: ', data.yellow);
        }
    });
    redis.getData('lcd_message_0', function (data) {
        if (data) {
            console.log('LCD message 0: ', data.yellow);
        }
    });
    redis.getData('lcd_message_1', function (data) {
        if (data) {
            console.log('LCD message 1: ', data.yellow);
        }
    });
    redis.getData('error_led', function (data) {
        if (data) {
            let string;

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
