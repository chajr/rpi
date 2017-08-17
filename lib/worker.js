let Config = require('./config');
let log = require('./log');
let worker = false;

let config = new Config;

let workerEnabled = config.get('app.worker_enabled');

exports.startWorker = function (app, workerTime, workerName) {
    if (!worker && workerEnabled) {
        log.logInfo(workerName + ' started.');
        app();
        worker = setInterval(app, workerTime);
    }
};

exports.stopWorker = function () {
    clearInterval(worker);
    worker = false;
};
