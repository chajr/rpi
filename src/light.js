const IlluminateNg = require('../lib/IluminateNg');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');

let config;
let illuminateNg;
let name = 'Light worker';
let launched = false;

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();
    illuminateNg = new IlluminateNg(config);

    worker.startWorker(
        light,
        config.get('workers..worker_time'),
        name
    );
};

function light() {
    redis.getData('illuminate_status', function (data) {
        if (data) {
            if (data === 'true' && !launched) {
                illuminateNg.on();
                launched = true;
                log.logInfo('Light turned on.');
            } else if (data === 'false' && launched) {
                illuminateNg.off();
                launched = false;
                log.logInfo('Light turned off.');
            }
        }
    });
}
