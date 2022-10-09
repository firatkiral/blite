const mid = require("../middleware");
const path = require('path');
const express = require("express");
const router = express.Router();
const sendMail = require("../mailer");
const sanitizer = require('sanitizer');
const db = require("../db");
const fs = require("fs");

router.use("/", express.static(path.join(__dirname, `www`)) )

router.post("/api/register",
    mid.register,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            user: req.user,
            message: "You successfully registered."
        });
    });

router.post("/api/login",
    mid.login,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            user: req.user,
            message: "You successfully logged in."
        });
    });

router.post("/api/authenticateSession",
    mid.authenticateSession,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "Session successfully authenticated."
        });
    });

router.post("/api/currentuser",
    mid.authenticateUser,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            user: req.user,
            message: "success"
        });
    });

router.post("/api/forgot",
    async (req, res) => {
        const username = sanitizer.sanitize(req.body.username)?.toLowerCase();

        const user = db.users.findOne({ '$or': [{ username }, { email: username }] });
        if (!user) {
            return res.status(400).json({
                code: "doesntexist",
                message: "User doesn't exist."
            });
        }

        const token = mid.generateAuthToken({ email: user.email }, "5m");
        const link = `${req.protocol}://${req.get('host')}/demo/reset?token=${token}`;
        const text = `Please use following link to reset your password: ${link}`;

        sendMail({ to: user.email, text }).then(result => {
            res.json({
                message: "Reset email has been sent."
            });
        }).catch(err => {
            res.status(400).json(err);
        });

    });

router.post("/api/reset",
    mid.decodeToken,
    mid.resetPassword,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "Password was successfully reset."
        });
    });

router.post("/api/logout",
    mid.logout,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "You successfully logged out."
        });
    });

router.post("/api/upload",
    mid.authenticateUser,
    mid.decodeUpload,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }

        const user = req.user

        const userpath = path.join(__dirname, `www/uploads/${user.username}`);
        if (!fs.existsSync(userpath)) {
            fs.mkdirSync(userpath, { recursive: true });
        }

        fs.renameSync(req.files.upload.filepath, `${userpath}/${req.files.upload.originalFilename}`);

        const uploadpath = `/demo/uploads/${user.username}/${req.files.upload.originalFilename}`;
        user.uploads = user.uploads ?? [];
        user.uploads.push(uploadpath);
        db.users.update(user);

        res.json({
            filepath: uploadpath,
            message: "File successfully uploaded."
        });
    });

router.get("/",
    async (req, res) => {
        res.sendFile(path.join(__dirname, 'www/demo.html'));
    });

router.get("/register",
    async (req, res) => {
        res.sendFile(path.join(__dirname, 'www/register.html'));
    });

router.get("/login",
    async (req, res) => {
        res.sendFile(path.join(__dirname, 'www/login.html'));
    });

router.get("/forgot",
    async (req, res) => {
        res.sendFile(path.join(__dirname, 'www/forgot.html'));
    });

router.get("/reset",
    async (req, res) => {
        res.sendFile(path.join(__dirname, 'www/reset.html'));
    });

module.exports = router;