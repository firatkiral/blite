const path = require('path');
const sanitizer = require('sanitizer');
const fs = require("fs");
const blite = require("../main");
const router = blite.server.Router();
const sendMail = blite.sendMail;

router.use("/", blite.server.static(path.join(__dirname, `www`)) )

router.post("/api/register",
    blite.mid.register,
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
    blite.mid.login,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "You successfully logged in."
        });
    });

router.post("/api/authenticateSession",
    blite.mid.authenticateSession,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "Session successfully authenticated."
        });
    });

router.post("/api/currentuser",
    blite.mid.authenticateUser,
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

        const user = blite.db.users.findOne({ '$or': [{ username }, { email: username }] });
        if (!user) {
            return res.status(400).json({
                code: "doesntexist",
                message: "User doesn't exist."
            });
        }

        const token = blite.mid.generateAuthToken({ email: user.email }, "5m");
        const link = `${req.protocol}://${req.get('host')}/reset?token=${token}`;
        const text = `Please use following link to reset your password: ${link}`;

        sendMail({ to: user.email, text }).then(result => {
            res.json({
                message: "Reset email has been sent."
            });
        }).catch(err => {
            res.status(400).json({message: err.message});
        });

    });

router.post("/api/reset",
    blite.mid.decodeToken,
    blite.mid.resetPassword,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "Password was successfully reset."
        });
    });

router.post("/api/logout",
    blite.mid.logout,
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "You successfully logged out."
        });
    });

router.post("/api/upload",
    blite.mid.authenticateUser,
    blite.mid.decodeUpload,
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

        const uploadpath = `/uploads/${user.username}/${req.files.upload.originalFilename}`;
        user.uploads = user.uploads ?? [];
        user.uploads.push(uploadpath);
        blite.db.users.update(user);

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