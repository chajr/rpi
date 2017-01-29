var lcd = require('../lib/lcd');
var Button = require('../lib/button');

var config;

/**
 * @todo show working time
 * @todo show last record status and time
 * @todo disk usage
 */

exports.launch = function (args, appConfig) {
    config = appConfig;
    init();
};

function init() {
    Button.watcher(
        config.get('alert_gpio.button_display'),
        function (status) {
            if (status) {
                lcd.lightOn();
            } else {
                lcd.lightOff();
            }
        }
    );

    lcd.init();
    lcd.displayMessage(['System init ok']);
}
