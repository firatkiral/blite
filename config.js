const fs = require('fs');
const path = require('path');
const config = require('./config.json');

let userConfig = path.join(path.resolve('./'), 'blite.config.json');

if (fs.existsSync(userConfig)) {
    userConfig = require(userConfig);
}

for (const key in userConfig) {
    if (typeof userConfig[key] === 'object') {
        for (const subKey in userConfig[key]) {
            if (!config[key]) {
                config[key] = {};
            }
            config[key][subKey] = userConfig[key][subKey];
        }
    }
    else {
        config[key] = userConfig[key];
    }
}

module.exports = config;