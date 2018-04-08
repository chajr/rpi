let Log = require('../lib/log');
let worker = require('../lib/worker');
let request = require('request');
let mongo = require('../lib/mongoDb');

let log = new Log();
let name = 'Command consumer worker';
let config;

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        consumer,
        config.get('workers.commandConsumer.worker_time'),
        name
    );
};

function consumer() {
    let url = config.get('workers.commandConsumer.commands_get')
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
                log.logError(error, '', true);
            } else {
                try {
                    let data = JSON.parse(body);

                    if (data.status === 'success') {
                        let messages = JSON.parse(data.data.message);

                        if (messages.length === 0) {
                            log.logInfo('No commands consumed.', '', true);
                        } else {
                            log.logInfo('Consumed: "' + messages.length + '" commands.', '', true);
                        }

                        for (let i in messages) {
                            addCommands(messages[i]);
                        }
                    } else {
                        log.logError(data.data.message);
                    }
                } catch (exception) {
                    log.logError(body);
                }
            }
        }
    );
}

function addCommands (command) {
    mongo.execute(function (db) {
        let collection = db.collection('rpiasCommand');

        let date = new Date;
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
                log.logError('Command insert error: ' + err, '', true);
            } else {
                log.logInfo('Command consumed: ' + JSON.stringify(command), '', true);
                setAsConsumed(command);
            }
        });
    });
}

function setAsConsumed (command) {
    let url = config.get('workers.commandConsumer.commands_set')
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
                log.logError(error, '', true);
            } else {
                if (response.statusCode === 200) {
                    let responseBody = JSON.parse(body);

                    if (responseBody.status === 'success') {
                        log.logInfo('Command with id: "' + command.command_id + '" marked as consumed.', '', true);
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
