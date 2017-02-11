/**
 * Created by xD3VHAX on 15/01/2017.
 */
const Spam = require("./../models/spam");
const logger = require("./../config/logger");
let Promise = require("bluebird");

function checkSpam(req, res, next) {
    try {
        req.params.nextTest = null;

        Spam.findOne({"ip_adress": req.headers["x-forwarded-for"]}, function (err, spam) {
            logger.success("checking spam");
            if (err) {
                logger.error(err);
                return next(err);
            }
            if (!spam) {
                logger.success("No spam detected");
                return next();
            }
            req.params.spamID = spam._id;
            logger.debug(spam._id);
            if (spam.attempts.length < 4) {
                logger.success("No spam detected");
                return next();
            }
            let waitTime = 10000;
            if (spam.attempts.length == 4) {
                waitTime = 20000;
            }
            else if (spam.attempts.length == 5) {
                waitTime = 30000;
            }
            else if (spam.attempts.length > 5) {
                waitTime = 60000;
                req.params.needCaptcha = true;
            }
            logger.error("spam detected ->" + spam.attempts.length);

            let diffMs = (new Date() - spam.attempts[spam.attempts.length - 1]);
            /*
             var diffDays = Math.floor(diffMs / 86400000); // days
             var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
             var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
             */
            if (diffMs < 300000) { // Si le dernier spam date de -5 min
                /*
                 logger.debug(120000 - diffMs);
                 req.params.nextTest = 120000 - diffMs;
                 */
                req.params.nextTest = waitTime;
            }
            next();
        });
    }
    catch (err) {
        logger.debug(err);
    }
}


function addSpam(req, res) {
    if (!req.params.spamID) {
        logger.success("This user have never spammed");
        const newSpam = new Spam();
        newSpam.ip_adress = req.headers["x-forwarded-for"];
        newSpam.attempts = new Date();
        newSpam.save(function (err) {
            if (err)
                throw err;
        });
    }
    else {
        logger.debug("This user have already spammed " + req.params.spamID);
        Spam.findOneAndUpdate(
            {_id: req.params.spamID},
            {$push: {attempts: new Date()}},
            {safe: true, upsert: true},
            function (err, model) {
                logger.error(err);
            }
        );
    }
}

module.exports = {
    checkSpam,
    addSpam
};
