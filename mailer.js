const config = require('./config');
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject = "", text = "", html }) {
    return new Promise((resolve, reject) => {

        if (!config.email.enabled) {
            reject(new Error("Email module is not enabled."));
            return
        }

        let transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: config.email.username,
                pass: config.email.password,
            },
        });

        transporter.sendMail({
            to,
            from: config.email.from,
            subject,
            text,
            html
        }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });

    });
}

module.exports = sendEmail;