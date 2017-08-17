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
                illuminateHandler(getData.query.status);
                break;

            case 'alert':
                if (getData.query.status === 'on') {
                    redis.setData('alert_armed', 'true');
                    log.logInfo('Alert turn on.');
                    led.on(config.get('alert_gpio.arm_led'));
                } else {
                    redis.setData('alert_armed', 'false');
                    log.logInfo('Alert turn off.');
                    led.off(config.get('alert_gpio.arm_led'));
                }
                break;

            default:
                responseData.status = 'fail';
                responseData.data = {
                    'message': 'Application is not specified.'
                };

                log.logInfo('Application is not specified: ' + getData.query.app);
        }
    }

    response.end(JSON.stringify(responseData));
}).listen(3000);

function illuminateHandler (paramValue) {
    switch (paramValue) {
        case 'force_on_enable':
            illuminate.launch(['on'], config);
            redis.setData('illuminate_force_on', true);
            log.logInfo('Light force on enable.');
            break;

        case 'force_on_disable':
            redis.setData('illuminate_force_on', false);
            log.logInfo('Light force on disable.');
            break;

        case 'force_off_enable':
            illuminate.launch(['off'], config);
            redis.setData('illuminate_force_off', true);
            log.logInfo('Light force off enabled.');
            break;

        case 'force_off_disable':
            redis.setData('illuminate_force_off', false);
            log.logInfo('Light force off disabled.');
            break;
    }
}

console.log('Server is running.');
