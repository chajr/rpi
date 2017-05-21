let illuminate = require('./illuminate');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');
let Iluminator = require('../lib/iluminator');

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
    let date = new Date();
    let sunCalc = SunCalc.getTimes(date, lt, gt);
    let iluminator = new Iluminator(date, config, launched, forceOn, sunCalc, keepAlive);

    iluminator.turnLightOn();
    iluminator.turnLightOff(forceOff);

    let status = iluminator.objectStatus();

    log.logInfo('Auto illuminate statuses:' + JSON.stringify(status));

    switch (true) {
        case status.turnOnStatus:
            illuminate.launch(['on'], config);
            redis.setData('illuminate_status', 'true');
            launched = true;

            log.logInfo('Auto illuminate turned on.');
            break;

        case status.turnOffStatus:
            illuminate.launch(['off'], config);
            redis.setData('illuminate_status', 'false');
            launched = false;

            log.logInfo('Auto illuminate turned off.');
            break;
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
