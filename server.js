var http = require('http');
var qs = require('querystring');
var log = require('./lib/log');
var config = require('./lib/config');
var url = require('url');
var illuminate = require('./src/illuminate');

http.createServer(function (request, response) {
    var postData = '';
    var responseData = {
        "status": 'success'
    };

    if (request.method === 'POST') {
        request.on('data', function (data) {
            postData += data;
        });

        request.on('end', function () {
            var postDataFull = qs.parse(postData);
        });
    }

    if (request.method === 'GET') {
        var getData = url.parse(request.url, true);

        switch (getData.query.app) {
            case 'illuminate':
                if (getData.query.status === 'on') {
                    illuminate.launch(['on'], config);
                    log.logInfo('Light turn on manually.');
                } else {
                    illuminate.launch(['off'], config);
                    log.logInfo('Light turn off manually.');
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

console.log('Server is running.');
