const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const logger = require('../config/logger');
const ExtractJwt = passportJWT.ExtractJwt;
const passport = require('passport');
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies && req.cookies['jwt']) {
        token = req.cookies['jwt'];
    }
    return token;
};

const headerExtractor = function (req) {
    let token = null;
    if (req.headers && req.headers.authorization) {
        const parted = req.headers.authorization.split(' ');
        if (parted.length === 2) {
            token = parted[1];
        }
    }
        return token;
};

const jwtOptions = [];
jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeader(), cookieExtractor]);
jwtOptions.secretOrKey = 'secretpass';



const createJwt = function(req, cbk){
    const payload = {};
    payload._id = req.user._id;
    logger.debug(payload);
    cbk(jwt.sign(payload , jwtOptions.secretOrKey, { expiresIn: 60*60 , algorithm: 'HS512'}));
};


function isConnected (req, res, next){
    passport.authenticate('jwt', {session: false}, function (err, user, info) {
        logger.debug('authentication');
        if (err) {
            logger.error(err);
            return next(err);
        }
        if (info)
        {
            logger.error(info.message);
        }
        if (!user) {
            return res.send("Redirect to login").end();
        }
        req.user = user;
        next();
    })(req, res, next);
}

module.exports = {
    jwtOptions,
    createJwt,
    isConnected
};