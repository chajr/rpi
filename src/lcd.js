let Lcd = require('../lib/lcd');
let redis = require('../lib/redis');
let Worker = require('../lib/worker');
let Log = require('../lib/log');

let name = 'LCD worker';

let config;
let messageRow = [null, null];

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    this.setMessage('', 0);
    this.setMessage('', 1);

    Lcd.init();
    Lcd.display(worker);
};

exports.setMessage = function (message, row = '0', messageShowTime = '10') {
    redis.setData('lcd_message_' + row, message, messageShowTime);
};

function worker () {
    Worker.startWorker(
        lcdMessage,
        config.get('workers.lcd_message.worker_time'),
        name
    );
}

function lcdMessage() {
    checkAndPrint(0);
    checkAndPrint(1);
}

function checkAndPrint (key) {
    redis.getData('lcd_message_' + key, function (data) {
        if (data) {
            let oldMessage = messageRow[key];

            messageRow[key] = data;

            if (messageRow[key] !== oldMessage) {
                Log.logInfo('Row ' + key + ' message: ' + data);
                Lcd.print(key, clearData(data));
            }
        }
    });
}

function clearData (data) {
    let empty = '                ';

    if (data === 'null') {
        return empty;
    }

    return data + empty;
}
