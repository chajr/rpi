var RaspiCam = require("raspicam");
var fs = require('fs');
var log = require('../lib/log.js');

exports.picture = function (config) {
    var time = new Date();

    var output = config.get('app.main_path')
        + '/'
        + config.get('app.img_path')
        + '/'
        + time.toLocaleTimeString()
        + '_'
        + time.toLocaleDateString()
        + "_%06d."
        + config.get('alert_gpio.image.encoding');

    var camera = new RaspiCam({
        mode: 'timelapse',
        output: output,
        encoding: config.get('alert_gpio.image.encoding'),
        width: config.get('alert_gpio.image.width'),
        height: config.get('alert_gpio.image.height'),
        timelapse: config.get('alert_gpio.image.timelapse'),
        timeout: config.get('alert_gpio.image.timeout')
    });

    if (config.get('app.image_send')) {
        camera.on('read', function (err, timestamp, filename) {
            if (!filename.match(
                    /^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}_[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}_[0-9]+\.jpg~$/)
            ) {
                log.logInfo('Picture created: ' + output);

                var formData = {
                    file: fs.createReadStream(
                        config.get('app.main_path')
                        + '/'
                        + config.get('app.img_path')
                        + '/' + filename
                    )
                };

                var url = config.get('alert_gpio.server_destination')
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

    camera.start();
};
