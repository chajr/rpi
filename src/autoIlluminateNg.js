let illuminate = require('./illuminate');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');
let SunCalc = require('suncalc');
let Iluminator = require('../lib/iluminator');

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