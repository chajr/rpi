let Log = require('../lib/log');
let redis = require('../lib/redis');
let lcdLib = require('../lib/lcd');
let lcd = require('./lcd');
let Button = require('../lib/button');

let config;
let armInterval;
let log = new Log();

exports.launch = function (args, appConfig) {
    config = appConfig;
    redis.connect();

    Button.watcher(appConfig, 'alert_gpio.button_status', function (status) {
        log.logInfo('Status button: ' + status, 'src', true);
    });

    Button.watcher(appConfig, 'alert_gpio.button_display', function (status) {
        log.logInfo('LCD light button: ' + status, 'src', true);
        if (status) {
            lcdLib.lightOn();
        } else {
            lcdLib.lightOff();
        }
    });

    Button.watcher(appConfig, 'alert_gpio.button_armed', function (status) {
        log.logInfo('Arm button: ' + status, 'src', true);

        redis.getData('alert_armed', function (isSystemArmed) {
            if (isSystemArmed === 'true') {
                redis.setData('alert_armed', 'false');
                lcd.setMessage('System unarmed');

                log.logInfo('Alert turn off.', 'src', true);
            } else if (isSystemArmed === 'false') {
                let armDelay = config.get('alert_gpio.arm_after');
                let timeout = armDelay/1000;

                lcd.setMessage('System arming', '0', '14');

                armInterval = setInterval(
                    function () {
                        if (timeout < 0) {
                            redis.setData('alert_armed', 'true');
                            lcd.setMessage('System armed');

                            log.logInfo('Alert turn on.', 'src', true);
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
