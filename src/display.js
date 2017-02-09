let lcd = require('./lcd');

let config;

/**
 * @todo show working time
 * @todo show last record status and time
 * @todo disk usage
 * @todo system status
 * @todo arm status
 */

exports.launch = function (args, appConfig) {
    config = appConfig;
    init();
};

function init() {
   
}
