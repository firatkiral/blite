const jwt = require("jsonwebtoken");
const formidable = require('formidable');
const sanitizer = require('sanitizer');
const bcrypt = require('bcrypt');
const blite = require("./main");

function generateAuthToken(params, expire = blite.config.auth.access_token_life) {
    const token = jwt.sign(params, blite.config.server.jwt_private_key, {
        algorithm: "HS256",
        expiresIn: expire
    });
    return token;
}

async function register(req, res, next) {
    try {
        const username = sanitizer.sanitize(req.body.username)?.toLowerCase();
        const email = sanitizer.sanitize(req.body.email)?.toLowerCase();
        const password = req.body.password;

        if (blite.db.users.exists({ '$or': [{ username }, { email }] })) {
            res.error = {
                code: "exists",
                message: "User already exists."
            };
            return next();
        }

        let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        req.user = blite.db.users.insert({ username, email, hash });

        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

async function login(req, res, next) {
    try {
        const username = sanitizer.sanitize(req.body.username)?.toLowerCase();
        const password = req.body.password;
        const remember = req.body.remember === "on" || req.body.remember === "true" || req.body.remember === true;

        const user = blite.db.users.findOne({ '$or': [{ username }, { email: username }] });
        if (!user) {
            res.error = {
                code: "invlid",
                message: "Invalid credentials."
            };
            return next();
        }

        if (!bcrypt.compareSync(password, user.hash)) {
            res.error = {
                code: "invlid",
                message: "Invalid credentials."
            };
            return next();
        }

        const refreshCookie = blite.config.auth.cookie_name + "_rt";
        const refreshToken = generateAuthToken({ id: user.id }, blite.config.auth.refresh_token_life);
        res.cookie(refreshCookie, refreshToken, { secure: req.secure, httpOnly: true, sameSite: true, maxAge: remember ? blite.config.auth.refresh_token_life : undefined });

        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

async function resetPassword(req, res, next) {
    try {
        if (res.error) {
            return next();
        }
        if (!req?.decoded?.email || !req.body.password) {
            res.error = {
                code: "exists",
                message: "Invalid link."
            };
            return next();
        }
        const email = req.decoded.email
        const password = req.body.password;

        const user = blite.db.users.findOne({email})
        if (!user) {
            res.error = {
                code: "exists",
                message: "User already exists."
            };
            return next();
        }

        let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        user.hash = hash
        req.user = blite.db.users.update(user);

        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

async function logout(req, res, next) {
    try {
        const refreshCookie = blite.config.auth.cookie_name + "_rt";
        const accessCookie = blite.config.auth.cookie_name + "_at";

        res.clearCookie(refreshCookie);
        res.clearCookie(accessCookie);

        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

async function authenticateSession(req, res, next) {
    try {
        const refreshCookie = blite.config.auth.cookie_name + "_rt";
        const accessCookie = blite.config.auth.cookie_name + "_at";
        let refreshToken = req.cookies[refreshCookie];

        if (!refreshToken) {
            res.error = {
                code: "nocookie",
                message: "No active user season."
            };
            return next();
        }

        const decoded = jwt.verify(refreshToken, blite.config.server.jwt_private_key);

        if (!blite.db.users.exists({ id: decoded.id })) {
            res.error = {
                code: "notfound",
                message: "User not found."
            };
            return next();
        }

        let accessToken = generateAuthToken({ id: decoded.id }); // 1 hour
        res.cookie(accessCookie, accessToken, { secure: req.secure, httpOnly: true, sameSite: true });

        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: "Session expired."
        };
        next();
    }
};

async function authenticateUser(req, res, next) {
    try {
        const accessCookie = blite.config.auth.cookie_name + "_at";
        let accessToken = req.cookies[accessCookie];

        if (!accessToken) {
            res.error = {
                code: "nocookie",
                message: "No active user season."
            };
            return next();
        }
        const decoded = jwt.verify(accessToken, blite.config.server.jwt_private_key); // this might be failed to catch block

        let user = blite.db.users.findOne({ id: decoded.id });
        if (!user) {
            res.error = {
                code: "notfound",
                message: "User not found."
            };
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

async function decodeToken(req, res, next) {
    try {
        let token = req.body.token;

        if (!token) {
            res.error = {
                code: "notoken",
                message: "No token provided."
            };
            return next();
        }

        const decoded = jwt.verify(token, blite.config.server.jwt_private_key);
        req.decoded = decoded;
        next();
    } catch (error) {
        res.error = {
            code: error.code,
            message: "Link expired."
        };
        next();
    }
};

async function decodeUpload(req, res, next) {
    try {
        var form = new formidable.IncomingForm({
            maxFileSize: blite.config.upload.max_file_size || undefined,
            uploadDir: blite.config.upload.dir || undefined
        });
        form.parse(req, async function (error, fields, files) {
            if (error) {
                res.error = {
                    code: error.code,
                    message: error.message
                };
                return next();
            };

            req.fields = fields;
            req.files = files;

            next();
        });

    } catch (error) {
        res.error = {
            code: error.code,
            message: error.message
        };
        next();
    }
};

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.authenticateSession = authenticateSession;
exports.authenticateUser = authenticateUser;
exports.decodeToken = decodeToken;
exports.decodeUpload = decodeUpload;
exports.generateAuthToken = generateAuthToken
exports.resetPassword = resetPassword