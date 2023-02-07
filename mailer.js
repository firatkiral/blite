const nodemailer = require("nodemailer");
const blite = require("./main");

async function sendEmail({ to, subject = "", text = "", html }) {
    return new Promise((resolve, reject) => {
        if (!blite.config.email) {
            reject(new Error("Email is not configured"));
            return
        }
        if (!blite.config.email.from) {
            reject(new Error("from email address not set"));
            return
        }
        if (!blite.config.email.host) {
            reject(new Error("email host not set"));
            return
        }
        if (!blite.config.email.port) {
            reject(new Error("email port not set"));
            return
        }
        if (!blite.config.email.username) {
            reject(new Error("email username not set"));
            return
        }
        if (!blite.config.email.password) {
            reject(new Error("email password not set"));
            return
        }

        let transporter = nodemailer.createTransport({
            host: blite.config.email.host,
            port: blite.config.email.port,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: blite.config.email.username,
                pass: blite.config.email.password,
            },
        });

        transporter.sendMail({
            to,
            from: blite.config.email.from,
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