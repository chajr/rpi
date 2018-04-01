const fs = require('fs');
const log = require('../lib/log');
const zlib = require('zlib');
const worker = require('../lib/worker');

let date = log.getDate();
const toSkip = [
    '.gitignore',
    'info_' + date + '.log',
    'error_' + date + '.log',
    'warning_' + date + '.log',
    'debug_' + date + '.log',
];

let config;
const name = 'Log compressor';

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        compress,
        config.get('workers.log.worker_time'),
        name
    );
};

function compress () {
    let logPath = config.get('app.main_path') + '/' + config.get('app.log_path') + '/';
    let files = fs.readdirSync(logPath);

    for (let index in files) {
        if (toSkip.indexOf(files[index]) > -1 || files[index].match(/.*\.gz$/)) {
            continue;
        }

        compressFile(logPath + files[index], () => {
            fs.unlink(logPath + files[index]);
        });
    }

    //@todo remove files after 1 year
}

function compressFile(filename, callback) {
    let compress = zlib.createGzip();
    let input = fs.createReadStream(filename);
    let output = fs.createWriteStream(filename + '.gz');

    input.pipe(compress).pipe(output);

    if (callback) {
        output.on('finish', callback);
    }
}

