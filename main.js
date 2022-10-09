const cookieParser = require("cookie-parser");
const config = require('./config');
const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if(config.demo_app){
    const demo = require("./demo/demo")
    app.use('/demo', demo);
}

function run() {
    const port = process.env.PORT || config.server.port;
    app.listen(port, () => console.log(`Listening on port ${port}...`));   
}

module.exports = {
    express:app,
    run,
    db
}