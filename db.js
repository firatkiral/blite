const fs = require('fs');
const controldb = require('controldb');
const crypto = require('crypto');
// const config = require('./config');


function init(params = { db: { name: "db", collections: [] }}) {
    const dbFile = `${params.db.name}.json`

    const db = new controldb(dbFile, {
        verbose: true,
        autosave: true,
        autosaveInterval: 5000
    });
    
    if (fs.existsSync(dbFile)) {
        db.loadJSON(fs.readFileSync(`${params.db.name}.json`));
        console.log("Database loaded.");
    }
    
    
    for (const c of params.db.collections) {
        let collection = db.getCollection(c.name);
        if (!collection) {
            collection = db.addCollection(c.name, c.options );
        }
        collection.on('insert', function (input) { input.id = crypto.randomUUID(); collection.update(input); })
        db[c.name] = collection
    }

    return db;
}

module.exports = {
    init
};