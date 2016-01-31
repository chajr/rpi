var exec = require('child_process').exec;
var startTime = new Date().getTime();
var config;

exports.launch = function (args, appConfig) {
    config = appConfig;
};
