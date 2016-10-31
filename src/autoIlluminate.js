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
    var turnOn = config.get('workers.autoIlluminate.turnOn').split(':');
    var minTime = config.get('workers.autoIlluminate.minimalTime').split(':');
    var maxTime = config.get('workers.autoIlluminate.shutDownTime').split(':');
    var date = new Date();
    var sunCalc = SunCalc.getTimes(date, lt, gt);
    var sunsetTime = sunCalc.sunset.getTime();
    var currentTime = date.getTime();

    date.setMinutes(turnOn[1]);
    date.setHours(turnOn[0]);

    var onTime = date.getTime();

    date.setMinutes(minTime[1]);
    date.setHours(minTime[0]);

    var minimalTime = date.getTime();

    date.setMinutes(maxTime[1]);
    date.setHours(maxTime[0]);

    var offTime = date.getTime();

    var nowGraterThanMinimal = currentTime >= minimalTime;
    var nowLowerThantOff = currentTime <= offTime;
    var nowGraterThanSunset = currentTime >= sunsetTime;
    var nowGraterThanOn = currentTime >= onTime;
    var nowGraterThanOff = currentTime >= offTime;
    var sunsetLowerThanOn = sunsetTime < onTime;
    var isWeekend = (date.getDay() + 1) % 7 == 0;

    var turnLightOn = (
        (!sunsetLowerThanOn && nowGraterThanSunset) || (sunsetLowerThanOn && nowGraterThanOn) || (isWeekend || nowGraterThanMinimal)
    ) && nowLowerThantOff;

    switch (true) {
        case !launched && (turnLightOn || forceOn):
            illuminate.launch(['on'], config);
            redis.setData('illuminate_status', 'true');
            launched = true;
            break;

        case launched && ((!keepAlive && nowGraterThanOff) || forceOff):
            illuminate.launch(['off'], config);
            redis.setData('illuminate_status', 'false');
            launched = false;
            break;
    }
}

function getRedisStatus (status) {
    redis.getData('illuminate_' + status, function (data) {
        if (data) {
            log.logInfo(data);

            switch (status) {
                case 'status':
                    launched = data === 'true';
                    break;
                case 'force_on':
                    forceOn = data === 'true';
                    break;
                case 'force_off':
                    forceOff = data === 'true';
                    break;
                case 'keep_alive':
                    keepAlive = data === 'true';
                    break;
            }
        }
    });
}
