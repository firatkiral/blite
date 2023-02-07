const cookieParser = require("cookie-parser");
const config = require('./config');
const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const blite = {
    init,
    demo
};

function start(params) {
    if (!blite.config) {
        init(params);
    }
    const port = process.env.PORT || blite.config.server.port;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
}

function demo() {
    const demoConf = {
        "db": {
            "name": "demo",
            "collections": [
                {
                    "name": "users",
                    "options": {
                        "indices": [
                            "username"
                        ],
                        "unique": [
                            "username",
                            "email"
                        ]
                    }
                }
            ]
        }
    };
    if (!blite.config) {
        init(demoConf);
    }
    blite.config = { ...blite.config, ...demoConf };
    const demo = require("./demo/demo");
    app.use('/', demo);
    start();
}

function init(params) {
    const cnf = { ...config, ...params };

    blite.start = start;
    blite.demo = demo;
    blite.server = app;
    blite.server.static = express.static;
    blite.server.Router = express.Router;
    blite.db = db.init(cnf);
    blite.config = cnf;
    blite.mid = require("./middleware");

    return blite;
}


module.exports = blite;