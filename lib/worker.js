var config = require('./config');
var log = require('./log');
var worker = false;
var workerEnabled = config.get('app.worker_enabled');

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
