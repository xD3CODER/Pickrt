/**
 * Created by xD3VHAX on 15/01/2017.
 */
const Spam = require('./../models/spam');
const logger = require('./../config/logger');
let  Promise = require('bluebird');

function checkSpam(req, res, next) {
    try {
        req.params.nextTest = null;

        Spam.findOne({'ip_adress': req.headers['x-forwarded-for']}, function (err, spam) {
            logger.success('checking spam');
            if (err) {
                logger.error(err);
                return next(err);
            }
            if (!spam ) {
                logger.success("No spam detected");
                return next();
            }
            req.params.spamID = spam._id;
            if (spam.attempts.length < 4 ) {
                logger.success("No spam detected");
                return next();
            }
            logger.error("spam detected");

            let diffMs = (new Date()-spam.attempts[spam.attempts.length - 1]);
            /*
             var diffDays = Math.floor(diffMs / 86400000); // days
             var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
             var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
             */
            if (diffMs < 120000) {
                logger.debug(120000 - diffMs);
                req.params.nextTest = 120000 - diffMs;

                if(spam.attempts.length > 3)
                {
                    req.params.needCaptcha = true;
                }
            }

             next();
        });
    }
    catch (err) {
        logger.debug(err);
    }
};




function addSpam(req, res)
{
        if (!req.params.spamID)
        {
            logger.success("This user have never spammed");
            const newSpam = new Spam();
            newSpam.ip_adress = req.headers['x-forwarded-for'];
            newSpam.attempts = new Date();
            newSpam.save(function(err) {
                if (err)
                    throw err;
            });
        }
        else if(!req.params.nextTest)
        {
            logger.debug("This user have already spammed "+ req.params.spamID);
            Spam.findOneAndUpdate(
                {_id: req.params.spamID},
                {$push: {attempts: new Date()}},
                {safe: true, upsert: true},
                function(err, model) {
                    console.log(err);
                }
            );
        }
}


/*
function addSpam(req, res)
{
    return new Promise(function(done, reject) {
        Spam.findOne({'ip_adress': req.headers['x-forwarded-for']}, function (err, user) {
            logger.debug('authentication');
            if (err) {
                logger.error(err);
                return reject(new Error(err));
            }
            if (!user) {
                return done('no_user');
            }
            else
            {
                return done(user);
            }
        });
    }).then(function(rep){
        if (rep == 'no_user')
        {
            logger.success("This user have never spammed");
            const newSpam = new Spam();
            newSpam.ip_adress = req.headers['x-forwarded-for'];
            newSpam.attempts = new Date();
            newSpam.save(function(err) {
                if (err)
                    throw err;
            });
        }
        else
        {
            logger.debug("This user have already spammed "+ rep);
            Spam.findOneAndUpdate(
                {_id: rep.id},
                {$push: {attempts: new Date()}},
                {safe: true, upsert: true},
                function(err, model) {
                    console.log(err);
                }
            );
        }
    })
}
*/
module.exports = {
    checkSpam,
    addSpam
};
