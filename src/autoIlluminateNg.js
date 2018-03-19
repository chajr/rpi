const IluminatorNg = require('../lib/iluminatorNg');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');

let config;
let iluminatorNg = [];
let name = 'Auto illuminateNg worker';
let force = false;
let launched = [
    false,
    false,
    false,
];
let statusObject = {};

const fixTime = 2615;

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    mergeConfig(config.get('workers.autoIlluminate.light.default'), 1);
    mergeConfig(config.get('workers.autoIlluminate.light.default'), 2);
    mergeConfig(config.get('workers.autoIlluminate.light.default'), 3);

    iluminatorNg = [
        new IluminatorNg(config, redis, 1),
        new IluminatorNg(config, redis, 2),
        new IluminatorNg(config, redis, 3),
    ];

    worker.startWorker(
        illuminator,
        config.get('workers.autoIlluminate.worker_time'),
        name
    );
};

function mergeConfig (defaultConfig, pinNumber) {
    let base = config.get('workers.autoIlluminate.light.' + pinNumber);

    let result = Object.assign({}, defaultConfig, base);

    redis.setData('illuminate_minimal_time_' + pinNumber, result.turnOn);
    redis.setData('illuminate_turn_on_' + pinNumber, result.minimalTime);
    redis.setData('illuminate_shut_down_time_' + pinNumber, result.shutDownTime);
} 

function illuminator () {
    getRedisStatus('status', 1);
    getRedisStatus('status', 2);
    getRedisStatus('status', 3);
    getRedisStatus('force');

    let lt = config.get('app.position.lt');
    let gt = config.get('app.position.gt');
    let date = new Date();
    let sunCalc = SunCalc.getTimes(fixDateForSunCalc(date), lt, gt);

    handleLight(1, sunCalc, date);
    handleLight(2, sunCalc, date);
    handleLight(3, sunCalc, date);
}

function handleLight (pinNumber, sunCalc, date) {
    iluminatorNg[pinNumber -1].calculateTimes(date, sunCalc, launched[pinNumber -1], force).calculateRange();

    log.logInfo(
        JSON.stringify(iluminatorNg[pinNumber -1].prepareLog())
    );

    let turnLightOn = iluminatorNg[pinNumber -1].turnLightOn();
    let turnLightOff = iluminatorNg[pinNumber -1].turnLightOff();

    if (!IluminatorNg.xor(turnLightOn, turnLightOff)) {
        return;
    }

    if (turnLightOn) {
        redis.setData('illuminate_status_' + pinNumber, 'true');
        launched[pinNumber] = true;

        log.logInfo('Auto illuminate Ng turned on: ' + pinNumber);
    }

    if (turnLightOff) {
        redis.setData('illuminate_status_' + pinNumber, 'false');
        launched[pinNumber] = false;

        log.logInfo('Auto illuminate Ng turned off: ' + pinNumber);
    }
}

function fixDateForSunCalc (date) {
    let micro = date.getTime() + (fixTime * 1000);

    return new Date(micro);
}

function getRedisStatus (status, pinNumber = false) {
    let redisKey = 'illuminate_' + status;

    if (pinNumber) {
        redisKey += '_' + pinNumber
    }

    redis.getData(redisKey, (data) => {
        if (data) {
            switch (status) {
                case 'status':
                    launched[pinNumber -1] = data === 'true';
                    statusObject.illuminateStatus = data;
                    break;

                case 'force':
                    force = data;
                    statusObject.illuminateForce = data;
                    break;

                default:
                    statusObject.unknownRedisStatus = data;
                    break;
            }
        }
    });
}
