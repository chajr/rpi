module.exports = class Config
{
    constructor (configPath) {
        let path = '../etc/config.json';

        if (typeof (configPath) !== 'undefined') {
            path = configPath;
        }

        this.configPath = require(path);
    }

    get (configPath) {
        let parts = configPath.split('.');
        return search(parts);
    }

    search (parts) {
        for (let part in parts) {
            let key = parts[part];
            let data = this.configPath[key];

            if (typeof data === 'object' && parts.length > 1) {
                parts.splice(0, 1);
                return search(parts, data);
            }

            return data;
        }
    }
};
