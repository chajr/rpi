let illuminate = require('./illuminate');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');
let IluminatorNg = require('../lib/iluminatorNg');

let config;
let name = 'Auto illuminateNg worker';
let force = false;
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

function illuminator () {
    getRedisStatus('status');
    getRedisStatus('force');

    let lt = config.get('app.position.lt');
    let gt = config.get('app.position.gt');
    let date = new Date();
    let sunCalc = SunCalc.getTimes(date, lt, gt);
    let iluminatorNg = new IluminatorNg(config, launched, force, sunCalc, date);

    let turnLightOn = iluminatorNg.turnLightOn();
    let turnLightOff = iluminatorNg.turnLightOff();

    if (IluminatorNg.xor(turnLightOn, turnLightOff)) {
        if (turnLightOn) {
            illuminate.launch(['on'], config);
            redis.setData('illuminate_status', 'true');
            launched = true;

            log.logInfo('Auto illuminate Ng turned on.');
        }

        if (turnLightOff) {
            illuminate.launch(['off'], config);
            redis.setData('illuminate_status', 'false');
            launched = false;

            log.logInfo('Auto illuminate Ng turned off.');
        }
    }
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