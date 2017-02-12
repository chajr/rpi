let RaspiCam = require("raspicam");
let fs = require('fs');
let log = require('../lib/log.js');
let request = require('request');
let currentRecord = false;
let camera = false;
let exec = require('child_process').exec;

exports.picture = function (config) {
    let time = new Date();

    let output = config.get('app.main_path')
        + '/'
        + config.get('app.img_path')
        + '/'
        + time.toLocaleTimeString()
        + '_'
        + time.toLocaleDateString()
        + "_%06d."
        + config.get('alert_gpio.image.encoding');

    let cameraPic = new RaspiCam({
        mode: 'timelapse',
        output: output,
        encoding: config.get('alert_gpio.image.encoding'),
        width: config.get('alert_gpio.image.width'),
        height: config.get('alert_gpio.image.height'),
        timelapse: config.get('alert_gpio.image.timelapse'),
        timeout: config.get('alert_gpio.image.timeout')
    });

    if (config.get('app.image_send')) {
        cameraPic.on('read', function (err, timestamp, filename) {
            if (!filename.match(
                    /^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}_[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}_[0-9]+\.jpg~$/)
            ) {
                log.logInfo('Picture created: ' + output);

                let formData = {
                    file: fs.createReadStream(
                        config.get('app.main_path')
                        + '/'
                        + config.get('app.img_path')
                        + '/' + filename
                    )
                };

                let url = config.get('alert_gpio.server_destination')
                    + '?key='
                    + config.get('app.security_key');

                request.post(
                    {
                        url: url,
                        formData: formData,
                        auth: {
                            user: config.get('auth.user'),
                            pass: config.get('auth.pass')
                        }
                    },
                    function optionalCallback(err, httpResponse, body) {
                        if (err) {
                            return console.error('upload failed:', err);
                        }

                        console.log('Upload successful!  Server responded with:', body);
                        log.logInfo('Upload successful!  Server responded with: ' + body);
                    }
                );
            }
        });
    }

    cameraPic.start();
};

exports.record = function () {
    this.cameraStop();

    console.log('start record');
    let time = new Date();
    currentRecord = time.getHours()
        + ':'
        + time.getMinutes()
        + ':'
        + time.getSeconds()
        + '_'
        + time.getDate()
        + '-'
        + (time.getMonth() +1)
        + '-'
        + time.getFullYear()
        + '.avi';

    camera = new RaspiCam({
        mode: "video",
        output: config.get('app.main_path') + '/' + config.get('app.movie_path') + '/' + currentRecord,
        timeout: config.get('alert_gpio.camera.timeout'),
        width: config.get('alert_gpio.camera.width'),
        height: config.get('alert_gpio.camera.height'),
        bitrate: config.get('alert_gpio.camera.bitrate'),
        framerate: config.get('alert_gpio.camera.framerate')
    });

    camera.start();

    console.log('record started');
};

exports.cameraStop =function () {
    if (camera) {
        camera.stop();

        if (config.get('alert_gpio.mode') === 'movie') {
            sendToRemote();
        }
    }
};

function sendToRemote() {
    if (currentRecord && config.get('app.movie_send')) {
        console.log('send file');
        let command = 'scp '
            + config.get('app.main_path')
            + '/'
            + config.get('app.movie_path')
            + '/'
            + currentRecord
            + ' '
            + config.get('alert_gpio.server_destination');

        exec(command, recordCallback);

        console.log('ended');
        currentRecord = false;
    }
}

function recordCallback(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    console.log(error);
}
