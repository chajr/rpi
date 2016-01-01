var http = require('http');
var qs = require('querystring');
var log = require('./lib/log');

console.log(process.argv);

http.createServer(function (req, res) {
    var postData = '';
    var response = '';

    console.log(process.argv);

    if (req.method === 'POST') {
        req.on('data', function (data) {
            console.log(data.toString());
            postData += data;
        });
        req.on('end', function (data) {
                var postDataFull = qs.parse(postData);
                
            }
        );
    }
}).listen(3000);

console.log('Server running');
