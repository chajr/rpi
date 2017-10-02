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
        + config.get('auth.security_key')
        + '&host='
        + config.get('app.system_name');

    request.post(
        url,
        {
            auth: {
                user: config.get('auth.user'),
                pass: config.get('auth.pass')
            }
        },
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                let data = {};

                try {
                    data = JSON.parse(body);
                } catch (exception) {
                    console.log(body);
                    data.status = 'fail';
                }

                if (data.status === 'success') {
                    var messages = JSON.parse(data.data.message);

                    if (messages.length === 0) {
                        log.logInfo('No commands consumed.');
                    } else {
                        log.logInfo('Consumed: "' + messages.length + '" commands.');
                    }

                    for (var i in messages) {
                        addCommands(messages[i]);
                    }
                } else {
                    log.logError(data.data.message);
                }
            }
        }
    );
}

function addCommands (command) {
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');

        var date = new Date;
        command.consummDate = date.getFullYear()
            + '-'
            + (date.getMonth() +1)
            + '-'
            + date.getDate()
            + ' '
            + date.getHours()
            + ':'
            + date.getMinutes()
            + ':'
            + date.getSeconds();
        command.executed = 0;
        command.output = '';
        command.error = 0;
        command.resend= 1;
        command.exec_time = '0000-00-00 00:00:00';

        collection.insertOne(command, function (err) {
            if (err) {
                log.logError('Command insert error: ' + err);
            } else {
                log.logInfo('Command consumed: ' + JSON.stringify(command));
                setAsConsumed(command);
            }
        });
    });
}

function setAsConsumed (command) {
    var url = config.get('workers.commandConsumer.commands_set')
        + '?key='
        + config.get('auth.security_key')
        + '&host='
        + config.get('app.system_name');

    request.post(
        url,
        {
            form:
            {
                command_id: command.command_id,
                command_consumed_date_time: command.consummDate,
                mongo_id: command._id.toString()
            },
            auth: {
                user: config.get('auth.user'),
                pass: config.get('auth.pass')
            }
        },
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                if (response.statusCode === 200) {
                    var responseBody = JSON.parse(body);

                    if (responseBody.status === 'success') {
                        log.logInfo('Command with id: "' + command.command_id + '" marked as consumed.');
                    } else {
                        log.logError(responseBody.data.message);
                    }
                } else {
                    log.logError(body);
                }
            }
        }
    );
}
