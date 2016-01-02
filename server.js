var http = require('http');
var qs = require('querystring');
var log = require('./lib/log');
var url = require('url');

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
    }

    response.end(JSON.stringify(responseData));
}).listen(3000);

console.log('Server is running.');
