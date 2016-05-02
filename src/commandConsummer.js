var log = require('../lib/log.js');
var worker = require('../lib/worker');
var config;
var name = 'Command consumer worker';

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        consumer,
        config.get('workers.commandConsumer.worker_time'),
        name
    );
};

function consumer() {
    
}
