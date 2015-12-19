var config = require('../etc/config.json');

exports.get = function (configPath) {
    var parts = configPath.split('.');
    return search(parts, config);
};

function search (parts, conf) {
    for (var part in parts) {
        var key = parts[part];
        var data = conf[key];

        if (typeof data === 'object') {
            parts.splice(0, 1);
            return search(parts, data);
        } else {
            return data;
        }
    }
}
