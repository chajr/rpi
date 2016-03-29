var illuminate = require('./illuminate');
var log = require('../lib/log.js');
var worker = require('../lib/worker');
var SunCalc = require('suncalc');
var config;
var name = 'Auto illuminate worker';
var keepAlive = false;
var launched = false;

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        illuminator,
        config.get('workers.autoIlluminate.worker_time'),
        name
    );
};

function illuminator() {
    var lt = config.get('app.position.lt');
    var gt = config.get('app.position.gt');
    var minTime = config.get('workers.autoIlluminate.minimalTime').split(':');
    var offTime = config.get('workers.autoIlluminate.shutDownTime').split(':');
    var date = new Date();
    var sunCalc = SunCalc.getTimes(date, lt, gt);
    var sunsetTime = sunCalc.sunset.getTime();
    var currentTime = date.getTime();

    date.setMinutes(minTime[0]);
    date.setHours(minTime[1]);

    var minimalTime = date.getTime();

    if (!launched && sunsetTime <= currentTime && sunsetTime <= minimalTime) {
        illuminate.launch(['on'], config);
        launched = true;
    }

    date.setMinutes(offTime[0]);
    date.setHours(offTime[1]);

    var shutdownTime = date.getTime();

    if (launched && !keepAlive && currentTime >= shutdownTime) {
        illuminate.launch(['off'], config);
        launched = false;
    }
}
