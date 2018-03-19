const IlluminateNg = require('../lib/IluminateNg');
let log = require('../lib/log.js');
let redis = require('../lib/redis.js');
let worker = require('../lib/worker');

let config;
let illuminateNg;
let name = 'Light worker';
let launched = [
    false,
    false,
    false,
];

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    setLaunched(1);
    setLaunched(2);
    setLaunched(3);

    illuminateNg = new IlluminateNg(config);

    worker.startWorker(
        light,
        config.get('workers.light.worker_time'),
        name
    );
};

function setLaunched (pinNumber) {
    redis.getData('illuminate_status_' + pinNumber, function (data) {
        launched[pinNumber -1] = data === 'true';
    });
}

function light() {
    onOff(1);
    onOff(2);
    onOff(3);
}

function onOff (pinNumber) {
    redis.getData('illuminate_status_' + pinNumber, (data) => {
        if (data) {
            switch (true) {
                case data === 'true' && !launched[pinNumber -1]:
                    illuminateNg.on(pinNumber);
                    launched[pinNumber -1] = true;
                    log.logInfo('Light turned on: ' + pinNumber);
                    break;

                case data === 'false' && launched[pinNumber -1]:
                    illuminateNg.off(pinNumber);
                    launched[pinNumber -1] = false;
                    log.logInfo('Light turned off: ' + pinNumber);
                    break;

                default:
                    log.logInfo(
                        'Heartbeat; Data: '
                        + data
                        + '; Launched: '
                        + launched[pinNumber -1]
                        + '; Pin number: '
                        + pinNumber
                    );
                    break;
            }
        }
    });
}

