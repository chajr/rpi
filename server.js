let http = require('http');
// let qs = require('querystring');
let Log = require('./lib/log');
let config = require('./lib/config');
let url = require('url');
let illuminate = require('./src/illuminate');
let redis = require('./lib/redis.js');
let led = require('./lib/led');

let log = new Log();

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
                illuminateHandler(getData.query, responseData);
                break;

            case 'alert':
                alertHandler(getData.query.status, responseData);
                break;

            default:
                responseData.status = 'fail';
                responseData.message ='Application is not specified.';

                log.logInfo('Application is not specified: ' + getData.query.app, 'server', true);
        }
    }

    response.end(JSON.stringify(responseData));
}).listen(3000);

function alertHandler (paramValue, responseData) {
    if (paramValue === 'on') {
        redis.setData('alert_armed', 'true');
        log.logInfo('Alert turn on.', 'server', true);
        led.on(config.get('alert_gpio.arm_led'));
        responseData.message = 'Alert enabled';
    } else {
        redis.setData('alert_armed', 'false');
        log.logInfo('Alert turn off.', 'server', true);
        led.off(config.get('alert_gpio.arm_led'));
        responseData.message = 'Alert disabled';
    }
}

function illuminateHandler (params, responseData) {
    switch (params.status) {
        case 'force_on':
            illuminate.launch(['on'], config);
            redis.setData('illuminate_force', true);
            log.logInfo('Light force on enable.', 'server', true);
            responseData.message = 'force enabled';
            break;

        case 'force_off':
            redis.setData('illuminate_force', false);
            log.logInfo('Light force on disable.', 'server', true);
            responseData.message = 'force disabled';
            break;

        case 'force_status':
            redis.getData('illuminate_force', function (data) {
                responseData.message = data === 'true' ? 'enabled' : 'disabled';
            });
            break;

        case 'force_default':
            redis.setData('illuminate_force', false);
            log.logInfo('Light force on disable.', 'server', true);
            responseData.message = 'force set to default';
            break;

        case 'set_time':
            redis.setData('illuminate_minimal_time', params.min_time);
            redis.setData('illuminate_turn_on', params.turn_on);
            redis.setData('illuminate_shut_down_time', params.turn_off);

            let logTime = JSON.stringify({});

            log.logInfo('Times set to: ' + logTime, 'server', true);
            responseData.message = 'new times set up';

            break;
    }
}

console.log('Server is running.');
