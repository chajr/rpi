var log = require('../lib/log.js');
var worker = require('../lib/worker');
var request = require('request');
var mongo = require('../lib/mongoDb');

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
                console.log(err);
            }

            for (var i in docs) {
                console.log(docs[i]);
            }
        });
    });
}
