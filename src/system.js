var exec = require('child_process').exec;
var log = require('../lib/log');
var worker = require('../lib/worker');
var config;
var name = 'System worker';

exports.launch = function (args, appConfig) {
    config = appConfig;
    
    worker.startWorker(
        collectData,
        config.get('workers.system.worker_time'),
        name
    );
};

function collectData() {
    log.logDebug(name + ' heartbeat.');
}
