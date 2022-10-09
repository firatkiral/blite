const fs = require('fs');
const loki = require('lokijs');
const crypto = require('crypto');
const config = require('./config');

loki.Collection.prototype.exists = function (args) {
    return !!this.find(args)[0];
};

dbFile = `${config.db.name}.json`

var db = new loki(dbFile, {
    verbose: true,
    autosave: true,
    autosaveInterval: 5000
});

if (fs.existsSync(dbFile)) {
    db.loadJSON(fs.readFileSync(`${config.db.name}.json`));
    console.log("Database loaded.");
}

for (const c of config.db.collections) {
    let collection = db.getCollection(c.name);
    if (!collection) {
        collection = db.addCollection(c.name, c.options );
    }
    collection.on('insert', function (input) { input.id = crypto.randomUUID(); })
    db[c.name] = collection
}

module.exports = db;