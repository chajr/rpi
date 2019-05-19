let Log = require('../lib/log');
var worker = require('../lib/worker');
var request = require('request');
var mongo = require('../lib/mongoDb');
const {execSync} = require('child_process');

let log = new Log();
var name = 'Command executor worker';
var config;

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        executor,
        config.get('workers.commandExecutor.worker_time'),
        name
    );
};

function executor () {
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');
        collection.find({executed: 0}).toArray(function(err, docs) {
            if (err) {
                log.logError(err, '', true);
            } else {
                if (docs.length === 0) {
                    log.logInfo('No commands executed.', '', true);
                } else {
                    log.logInfo('"' + docs.length + '" commands to execute.', '', true);
                }

                for (var i in docs) {
                    executeCommand(docs[i]);
                }
            }
        });
    });
}

function executeCommand (command) {
    var currentTime = new Date();

    if (command.to_be_exec !== null && command.to_be_exec !== '0000-00-00 00:00:00') {
        var execTime = new Date(command.to_be_exec);

        if (execTime > currentTime) {
            log.logInfo(
                'Command with id: "' + command.command_id + '" should be executed later: ' + command.to_be_exec,
                '',
                true
            );

            return null;
        }
    }

    let ls;
    let output;
    let error = 0;

    try {
        ls = execSync(command.command);
    } catch (exception) {
        error = 1;
        ls = exception.stderr
    } finally {
        const out = Buffer.from(ls);
        output = out.toString().replace("\n", '');
    }

    if (error) {
        log.logError('Error on command with id: "' + command.command_id + '": ' + output, '', true);
    } else {
        log.logInfo('Command with id: "' + command.command_id + '" executed successfully.', '', true);
    }

    var update = {
        $set: {
            executed: 1,
            output: output,
            error: error,
            exec_time: currentTime.getFullYear()
                + '-'
                + (currentTime.getMonth() +1)
                + '-'
                + currentTime.getDate()
                + ' '
                + currentTime.getHours()
                + ':'
                + currentTime.getMinutes()
                + ':'
                + currentTime.getSeconds()
        }
    };

    updateMongo(command.command_id, update);
    updateDb(command.command_id, update);

    return null;
}

function updateMongo (commandId, update) {
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');

        collection.updateOne({command_id: commandId}, update, function(err) {
            if (err) {
                log.logError(err, '', true);
            }
        });
    });
}

function updateDb (commandId, update) {
    var url = config.get('workers.commandConsumer.commands_set')
        + '?key='
        + config.get('auth.security_key')
        + '&host='
        + config.get('app.system_name');

    request.post(
        url,
        {
            form: {
                command_id: commandId,
                data_update: true,
                executed: update.$set.executed,
                output: update.$set.output,
                error: update.$set.error,
                exec_time: update.$set.exec_time
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
                    var responseBody = JSON.parse(body);

                    if (responseBody.status === 'success') {
                        log.logInfo('Command with id: "' + commandId + '" send to server.', '', true);
                        updateMongo(
                            commandId,
                            {
                                $set: {resend: 0}
                            }
                        );
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
