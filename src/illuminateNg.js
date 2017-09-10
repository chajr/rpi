const IlluminateNg = require('./illuminateNg');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');

let config;
let illuminateNg;
let name = 'IlluminateNg worker';
let launched = false;

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();
    // illuminateNg = new IlluminateNg(config);

    worker.startWorker(
        illuminator,
        config.get('workers..worker_time'),
        name
    );
};
