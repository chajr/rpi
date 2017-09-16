const IluminatorNg = require('../lib/iluminatorNg');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');

let config;
let iluminatorNg;
let name = 'Auto illuminateNg worker';
let force = false;
let launched = false;
let statusObject = {};

const fixTime = 2615;

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();
    iluminatorNg = new IluminatorNg(config);

    worker.startWorker(
        illuminator,
        config.get('workers.autoIlluminate.worker_time'),
        name
    );
};

function illuminator () {
    getRedisStatus('status');
    getRedisStatus('force');

    let lt = config.get('app.position.lt');
    let gt = config.get('app.position.gt');
    let date = new Date();
    let sunCalc = SunCalc.getTimes(fixDateForSuncalc(date), lt, gt);

    iluminatorNg.calculateTimes(date, sunCalc, launched, force).calculateRange();

    log.logInfo(
        JSON.stringify(iluminatorNg.prepareLog())
    );

    let turnLightOn = iluminatorNg.turnLightOn();
    let turnLightOff = iluminatorNg.turnLightOff();

    if (!IluminatorNg.xor(turnLightOn, turnLightOff)) {
        return;
    }

    if (turnLightOn) {
        redis.setData('illuminate_status', 'true');
        launched = true;

        log.logInfo('Auto illuminate Ng turned on.');
    }

    if (turnLightOff) {
        redis.setData('illuminate_status', 'false');
        launched = false;

        log.logInfo('Auto illuminate Ng turned off.');
    }
}

function fixDateForSuncalc (date) {
    let stamp = date.getTime();
    let micro = stamp.getTime() + (fixTime * 1000);

    return new Date(micro);
}

function getRedisStatus (status) {
    redis.getData('illuminate_' + status, function (data) {
        if (data) {
            switch (status) {
                case 'status':
                    launched = data === 'true';
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