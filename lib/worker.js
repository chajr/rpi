var config = require('./config');
var log = require('./log');
var worker = false;
var workerEnabled = config.get('app.worker_enabled');

exports.startWorker = function (app, workerTime, workerName) {
    if (workerEnabled) {
        app();
    }

    if (!worker && workerEnabled) {
        worker = setInterval(app, workerTime);
        log.logInfo(workerName + ' started.');
    }
};

exports.stopWorker = function () {
    clearInterval(worker);
    worker = false;
};
