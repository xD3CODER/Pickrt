const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../config/images');
let fs = require('fs');
const logger = require('../config/logger');
const jwtTokens = require ('../config/jwt-tokens');
const Spam = require('../models/spam');

function checkSpam(req, res, next) {
    try {
        Spam.findOne({'ip_adress': req.headers['x-forwarded-for']}, function (err, user) {
            logger.debug('authentication');
            if (err) {
                logger.error(err);
                return next(err);
            }
            if (!user) {
                logger.debug("No spam detected")
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
          /*  Spam.update({_id: rep._id}, {
                attempts: rep.attempts +', '+ new Date()
            }, function(err, affected, resp) {
                console.log(resp);
            })
*/
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

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.info('Current session = ' + req.session.id);
});



router.get('/vc', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


    router.get('/login', function(req, res, next) {
    res.render('login.ejs', {message: req.flash('loginMessage')});

});

router.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('registerMessage') });
});

router.get('/profile', jwtTokens.isConnected, function(req, res) {
  res.render('profile.ejs', { user: req.user });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));


router.post('/login', checkSpam,  function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) { return next(err); }
        if(info){logger.error(info)}

            if (!user) {
                addSpam(req,res);
                return res.redirect('/login');
        }
            req.logIn(user, function(err) {
            if (err) { return next(err); }
                jwtTokens.createJwt(req, function(token){
                    const cookieAge = 1000 * 60 * 60 * 24 * 365;
                    res.cookie(jwtTokens.jwtOptions.cookieName, token, { maxAge: cookieAge, httpOnly: true, secure: true });
                    res.redirect('/profile');
                });
            });
    })(req, res, next);
});


router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_birthday'] }));

router.get('/auth/facebook/callback', passport.authenticate('facebook'), function(req, res) {
    jwtTokens.createJwt(req, function(token){
        res.cookie(jwtTokens.jwtOptions.cookieName, token, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true, secure: true });
        res.redirect('/profile');
    });

    //res.redirect('/profile');
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));

module.exports = router;



