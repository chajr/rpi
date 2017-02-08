let log = require('../lib/log');
let redis = require('../lib/redis');
let lcdLib = require('../lib/lcd');
let lcd = require('./lcd');
let Button = require('../lib/button');

let config;
let armInterval;

exports.launch = function (args, appConfig) {
    config = appConfig;

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
            if (isSystemArmed) {
                redis.setData('alert_armed', 'false');
                lcd.setMessage('System unarmed');

                log.logInfo('Alert turn off.');
            } else if (!isSystemArmed) {
                let armDelay = config.get('alert_gpio.arm_after');
                let timeout = armDelay/100;

                lcd.setMessage('System arming');

                armInterval = setInterval(
                    function () {
                        if (timeout < 0) {
                            redis.setData('alert_armed', 'true');
                            lcd.setMessage('System armed');
                            lcd.setMessage('', 1);

                            log.logInfo('Alert turn on.');
                            isSystemArmed = true;

                            clearInterval(armInterval);
                            return;
                        }

                        lcd.setMessage('after: ' + timeout-- + 's', 1);
                    },
                    1000
                );
            }
        });
    });
};
