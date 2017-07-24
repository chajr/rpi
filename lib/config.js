exports.get = function (configPath) {
    let config;

    if (typeof (testConfig) === 'undefined') {
        config = require('../etc/config.json');
    } else {
        config = require(testConfig);
    }

    let parts = configPath.split('.');
    return search(parts, config);
};

function search (parts, conf) {
    for (let part in parts) {
        let key = parts[part];
        let data = conf[key];

        if (typeof data === 'object' && parts.length > 1) {
            parts.splice(0, 1);
            return search(parts, data);
        }

        return data;
    }
}
