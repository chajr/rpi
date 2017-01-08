var log = require('../lib/log.js');
var worker = require('../lib/worker');
var request = require('request');
var mongo = require('../lib/mongoDb');
var exec = require('sync-exec');

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
        collection.find({executed: {$lt: 1}}).toArray(function(err, docs) {
            if (err) {
                log.logError(err);
            } else {
                for (var i in docs) {
                    executeCommand(docs[i])
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
                'Command with id: "' + command.command_id + '" should be executed later: ' + command.to_be_exec
            );

            return null;
        }
    }

    var outputErr = exec(command.command).stderr.replace("\n", '');
    var output = exec(command.command).stdout.replace("\n", '');
    var error = 0;

    if (outputErr) {
        output = outputErr;
        error = 1;
        log.logError('Error on command with id: "' + command.command_id + '": ' + outputErr);
    } else {
        log.logInfo('Command with id: "' + command.command_id + '" executed successfully.');
    }

    updateMongo(command, output, error);
    updateDb(command, output, error);

    return null;
}

function updateMongo (command, output, error) {
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');
        var update = {};

        collection.updateOne(update, function(err) {
            if (err) {
                log.logError(err);
            } else {

            }
        });
    });
}

function updateDb (command, output, error) {
    var response = {
        mongo_id: command._id.toString(),
        command_id: command.command_id,
        error: error
    };
}
