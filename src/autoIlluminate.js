let illuminate = require('./illuminate');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');
let config;
let name = 'Auto illuminate worker';
let keepAlive = false;
let forceOn = false;
let forceOff = false;
let launched = false;
let statusObject = {};

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    worker.startWorker(
        illuminator,
        config.get('workers.autoIlluminate.worker_time'),
        name
    );
};

function illuminator() {
    getRedisStatus('status');
    getRedisStatus('force_on');
    getRedisStatus('force_off');
    getRedisStatus('keep_alive');

    let lt = config.get('app.position.lt');
    let gt = config.get('app.position.gt');
    statusObject.turnOn = config.get('workers.autoIlluminate.turnOn').split(':');
    statusObject.minTime = config.get('workers.autoIlluminate.minimalTime').split(':');
    statusObject.maxTime = config.get('workers.autoIlluminate.shutDownTime').split(':');
    let date = new Date();
    let sunCalc = SunCalc.getTimes(date, lt, gt);
    let sunsetTime = sunCalc.sunset.getTime() + (2 * 60 * 60 *1000);
    let currentTime = date.getTime();
    statusObject.sunsetTime = sunCalc.sunset.getHours()
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

    date.setMinutes(statusObject.turnOn[1]);
    date.setHours(statusObject.turnOn[0]);

    let onTime = date.getTime();

    date.setMinutes(statusObject.minTime[1]);
    date.setHours(statusObject.minTime[0]);

    let minimalTime = date.getTime();

    date.setMinutes(statusObject.maxTime[1]);
    date.setHours(statusObject.maxTime[0]);

    let offTime = date.getTime();

    statusObject.nowGraterThanMinimal = currentTime >= minimalTime;
    statusObject.nowLowerThantOff = currentTime <= offTime;
    statusObject.nowGraterThanSunset = currentTime >= sunsetTime;
    statusObject.nowGraterThanOn = currentTime >= onTime;
    statusObject.nowGraterThanOff = currentTime >= offTime;
    statusObject.sunsetLowerThanOn = sunsetTime < onTime;
    statusObject.isWeekend = date.getDay() % 6 === 0;
    statusObject.isSpacialDay = isSpecialDay(date);

    let turnLightOn = (
        (!statusObject.sunsetLowerThanOn && statusObject.nowGraterThanSunset)
        || (statusObject.sunsetLowerThanOn && statusObject.nowGraterThanOn)
        || (
            ((statusObject.isWeekend || statusObject.isSpacialDay) && statusObject.nowGraterThanSunset)
            || statusObject.nowGraterThanMinimal
        )
    ) && statusObject.nowLowerThantOff;

    statusObject.turnLightOn = turnLightOn;
    statusObject.launched = launched;
    statusObject.turnOnStatus = !launched && (turnLightOn || forceOn);

    statusObject.alive = !keepAlive && statusObject.nowGraterThanOff;
    statusObject.force = !forceOn && !turnLightOn;
    statusObject.turnOffStatus = launched && (statusObject.alive || statusObject.force || forceOff);

    log.logInfo('Auto illuminate statuses:' + JSON.stringify(statusObject));

    switch (true) {
        case statusObject.turnOnStatus:
            illuminate.launch(['on'], config);
            redis.setData('illuminate_status', 'true');
            launched = true;

            log.logInfo('Auto illuminate turned on.');
            break;

        case statusObject.turnOffStatus:
            illuminate.launch(['off'], config);
            redis.setData('illuminate_status', 'false');
            launched = false;

            log.logInfo('Auto illuminate turned off.');
            break;
    }
}

function isSpecialDay (currentDate) {
    let day = currentDate.getDate();
    let month = currentDate.getMonth() +1;
    let special = config.get('illuminate_special.' + month);

    if (typeof(special) !== "undefined") {
        return special.indexOf(day) >= 0;
    }

    return false;
}

function getRedisStatus (status) {
    redis.getData('illuminate_' + status, function (data) {
        if (data) {
            switch (status) {
                case 'status':
                    launched = data === 'true';
                    statusObject.illuminateStatus = data;
                    break;
                case 'force_on':
                    forceOn = data === 'true';
                    statusObject.illuminateForceOn = data;
                    break;
                case 'force_off':
                    forceOff = data === 'true';
                    statusObject.illuminateForceOff = data;
                    break;
                case 'keep_alive':
                    keepAlive = data === 'true';
                    statusObject.illuminateKeepAlive = data;
                    break;

                default:
                    statusObject.unknownRedisStatus = data;
                    break;
            }
        }
    });
}
