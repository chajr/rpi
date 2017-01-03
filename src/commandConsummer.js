var log = require('../lib/log.js');
var worker = require('../lib/worker');
var request = require('request');
var mongo = require('../lib/mongoDb');

var name = 'Command consumer worker';
var config;

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        consumer,
        config.get('workers.commandConsumer.worker_time'),
        name
    );
};

function consumer() {
    var url = config.get('workers.commandConsumer.commands_get')
        + '?key='
        + config.get('workers.commandConsumer.security_key')
        + '&host='
        + config.get('app.system_name');

    request.post(
        url,
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                var data = JSON.parse(body);

                if (data.status === 'success') {
                    var messages = JSON.parse(data.data.message);

                    for (var i in messages) {
                        console.log(messages[i]);
                        setCommands(messages[i]);
                    }
                } else {
                    
                }
            }
        }
    );
}

function getCommands () {
    var container;
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');
        collection.find({command_id: 3}).toArray(function(err, docs) {
            if (err) {

            }

            console.log(docs);
            container = docs;
        });
    });
}

function setCommands (command) {
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');

        collection.insertOne(command, function (err, result) {
            if (err) {
                log.logError('Command insert error: ' + err);
            } else {
                command.id = result.insertedId;
                log.logInfo('Command consumed: ' + JSON.stringify(command) );

                setAsConsumed(command.command_id);
            }
        });
    });
}

function setAsConsumed (commandId) {
    var url = config.get('workers.commandConsumer.commands_set')
        + '?key='
        + config.get('workers.commandConsumer.security_key')
        + '&host='
        + config.get('app.system_name');

    console.log(url);
    console.log(commandId);

    request.post(
        url,
        {form: {test_key: 'test'}},
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                console.log(response.statusCode);
                console.log(body);
            }

            process.exit(0);
        }
    );
}
