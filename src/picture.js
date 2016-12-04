var log = require('../lib/log.js');
var RaspiCam = require("raspicam");
var fs = require('fs');
var request = require('request');
var exec = require('child_process').exec;
var config;

exports.launch = function (args, appConfig) {
    config = appConfig;
};
