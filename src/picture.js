let Log = require('../lib/log');
var RaspiCam = require("raspicam");
var fs = require('fs');
var request = require('request');
var exec = require('child_process').exec;
var config;

let log = new Log();

exports.launch = function (args, appConfig) {
    config = appConfig;
};
