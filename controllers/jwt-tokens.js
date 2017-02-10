const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const logger = require('../config/logger');
const ExtractJwt = passportJWT.ExtractJwt;
const passport = require('passport');
const jwtOptions = [];
jwtOptions.cookieName = 'p_usr';
const User = require('./../models/user');
let Promise = require('bluebird');

const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies && req.cookies[jwtOptions.cookieName]) {
        token = req.cookies[jwtOptions.cookieName];
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


jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([cookieExtractor]);
jwtOptions.secretOrKey = 'secretpass';


const createJwt = function (req) {
    return new Promise(function (done, reject) {
        const payload = {};
        payload._id = req.user._id;
        logger.debug('CreateJwt => ' + payload);
        jwt.sign(payload, jwtOptions.secretOrKey, {expiresIn: 60 * 60 * 3600, algorithm: 'HS512'}, function(err, token) {
            if (err){return reject(new Error(err))}
            return done(token)
        });
    });
};


const isConnected = function (token) {
    return new Promise(function (done, reject) {
        jwt.verify(token, jwtOptions.secretOrKey, function (err, decoded) {
            if (err) {
                return reject(new Error(err))
            }
            try {
                User.findOne({'_id': decoded._id}, function (err, user) {
                    if (err) {
                        return reject(new Error(err));
                    }
                    else if (user) {
                        return done(user);
                    }
                    else {
                        return reject(new Error("User not found"));
                    }
                });
            }
            catch (err) {
                reject(new Error(err))
            }
        });

    });
}

module.exports = {
    jwtOptions,
    createJwt,
    isConnected,
    headerExtractor
};