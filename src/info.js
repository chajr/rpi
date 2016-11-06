require('console.table');
var colors = require('colors');
var config;

exports.launch = function (args, appConfig) {
    config = appConfig;

    getSusnetTime();
};

function getSusnetTime() {
    var lt = config.get('app.position.lt');
    var gt = config.get('app.position.gt');
    var date = new Date();
    var SunCalc = require('suncalc');
    var sunCalc = SunCalc.getTimes(date, lt, gt);
    var sunsetTime = sunCalc.sunset.getHours()
        + ':'
        + sunCalc.sunset.getMinutes()
        + ':'
        + sunCalc.sunset.getSeconds()
        + ' '
        + sunCalc.sunset.getDate()
        + '-'
        + (sunCalc.sunset.getMonth() +1)
        + '-'
        + sunCalc.sunset.getFullYear();

    console.log('Sunset time for current position: ', sunsetTime.green);
}
