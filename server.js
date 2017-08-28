let http = require('http');
// let qs = require('querystring');
let log = require('./lib/log');
let config = require('./lib/config');
let url = require('url');
let illuminate = require('./src/illuminate');
let redis = require('./lib/redis.js');
let led = require('./lib/led');

http.createServer(function (request, response) {
    redis.connect();

    // let postData = '';
    let responseData = {
        "status": 'success'
    };

    // if (request.method === 'POST') {
    //     request.on('data', function (data) {
    //         postData += data;
    //     });
    //
    //     request.on('end', function () {
    //         let postDataFull = qs.parse(postData);
    //     });
    // }

    if (request.method === 'GET') {
        let getData = url.parse(request.url, true);

        switch (getData.query.app) {
            case 'illuminate':
                illuminateHandler(getData.query.status, responseData);
                break;

            case 'alert':
                alertHandler(getData.query.status, responseData);
                break;

            default:
                responseData.status = 'fail';
                responseData.message ='Application is not specified.';

                log.logInfo('Application is not specified: ' + getData.query.app);
        }
    }

    response.end(JSON.stringify(responseData));
}).listen(3000);

function alertHandler (paramValue, responseData) {
    if (paramValue === 'on') {
        redis.setData('alert_armed', 'true');
        log.logInfo('Alert turn on.');
        led.on(config.get('alert_gpio.arm_led'));
        responseData.message = 'Alert enabled';
    } else {
        redis.setData('alert_armed', 'false');
        log.logInfo('Alert turn off.');
        led.off(config.get('alert_gpio.arm_led'));
        responseData.message = 'Alert disabled';
    }
}

function illuminateHandler (paramValue, responseData) {
    switch (paramValue) {
        case 'force_on':
            illuminate.launch(['on'], config);
            redis.setData('illuminate_force', true);
            log.logInfo('Light force on enable.');
            responseData.message = 'enabled';
            break;

        case 'force_off':
            redis.setData('illuminate_force', false);
            log.logInfo('Light force on disable.');
            responseData.message = 'disabled';
            break;

        case 'force_status':
            redis.getData('illuminate_force', function (data) {
                responseData.message = data === 'true' ? 'enabled' : 'disabled';
            });
            break;
    }
}

console.log('Server is running.');
