var illuminate = require('./illuminate');
var log = require('../lib/log.js');
var redis = require('../lib/redis.js');
var worker = require('../lib/worker');
var SunCalc = require('suncalc');
var config;
var name = 'Auto illuminate worker';
var keepAlive = false;
var forceOn = false;
var forceOff = false;
var launched = false;
var statusObject = {};

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

    var lt = config.get('app.position.lt');
    var gt = config.get('app.position.gt');
    statusObject.turnOn = config.get('workers.autoIlluminate.turnOn').split(':');
    statusObject.minTime = config.get('workers.autoIlluminate.minimalTime').split(':');
    statusObject.maxTime = config.get('workers.autoIlluminate.shutDownTime').split(':');
    var date = new Date();
    var sunCalc = SunCalc.getTimes(date, lt, gt);
    var sunsetTime = sunCalc.sunset.getTime();
    var currentTime = date.getTime();
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

    var onTime = date.getTime();

    date.setMinutes(statusObject.minTime[1]);
    date.setHours(statusObject.minTime[0]);

    var minimalTime = date.getTime();

    date.setMinutes(statusObject.maxTime[1]);
    date.setHours(statusObject.maxTime[0]);

    var offTime = date.getTime();

    statusObject.nowGraterThanMinimal = currentTime >= minimalTime;
    statusObject.nowLowerThantOff = currentTime <= offTime;
    statusObject.nowGraterThanSunset = currentTime >= sunsetTime;
    statusObject.nowGraterThanOn = currentTime >= onTime;
    statusObject.nowGraterThanOff = currentTime >= offTime;
    statusObject.sunsetLowerThanOn = sunsetTime < onTime;
    statusObject.isWeekend = date.getDay() % 6 === 0;
    statusObject.isSpacialDay = isSpecialDay(date);

    var turnLightOn = (
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
    statusObject.turnOffStatus = launched && ((!keepAlive && statusObject.nowGraterThanOff) || forceOff);

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
    var day = currentDate.getDate();
    var expression = new RegExp(day + ",");
    var month = currentDate.getMonth() +1;
    var special = config.get('illuminate_special.' + month);

    return special.search(expression) > 0;
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
