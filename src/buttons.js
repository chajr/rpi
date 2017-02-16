let log = require('../lib/log');
let redis = require('../lib/redis');
let lcdLib = require('../lib/lcd');
let lcd = require('./lcd');
let Button = require('../lib/button');

let config;
let armInterval;

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    Button.watcher(appConfig, 'alert_gpio.button_status', function (status) {
        log.logInfo('Status button: ' + status);
    });

    Button.watcher(appConfig, 'alert_gpio.button_display', function (status) {
        if (status) {
            lcdLib.lightOn();
        } else {
            lcdLib.lightOff();
        }
    });

    Button.watcher(appConfig, 'alert_gpio.button_armed', function () {
        redis.getData('alert_armed', function (isSystemArmed) {
            if (isSystemArmed === 'true') {
                redis.setData('alert_armed', 'false');
                lcd.setMessage('System unarmed');

                log.logInfo('Alert turn off.');
            } else if (isSystemArmed === 'false') {
                let armDelay = config.get('alert_gpio.arm_after');
                let timeout = armDelay/1000;

                lcd.setMessage('System arming', '0', '14');

                armInterval = setInterval(
                    function () {
                        if (timeout < 0) {
                            redis.setData('alert_armed', 'true');
                            lcd.setMessage('System armed');

                            log.logInfo('Alert turn on.');
                            isSystemArmed = true;

                            clearInterval(armInterval);
                            return;
                        }

                        lcd.setMessage('after: ' + timeout-- + 's', '1', '2');
                    },
                    1000
                );
            }
        });
    });
};
