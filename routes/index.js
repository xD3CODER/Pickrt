const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../config/images');
let fs = require('fs');
const logger = require('../config/logger');
const jwtTokens = require ('../config/jwt-tokens');
const spam = require("./../treatments/spam");
router.get('/', function(req, res, next) {
  res.render('index.ejs', { title: 'Express' });
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

function decryptRequest(req,res,next){
    let finalReq = {};
    for(var attributename in req.body){
        var value = Buffer.from(req.body[attributename], 'base64').toString();
        var attributename = Buffer.from(attributename, 'base64').toString();
        finalReq[attributename] = value;
    }
    req.body = finalReq;
    next();
}



router.post('/login',decryptRequest, spam.checkSpam,  function(req, res, next) {
    if(req.param("nextTest"))
    {
        return res.json({"_spam" : req.param('nextTest'), "_captcha" : req.param("needCaptcha")});
    }
    logger.debug(req.body.login_adress);
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {  return res.json({"_error": err}); }
        if(info){
            logger.error(info);
          //  return res.json({"_error": info});
        }
            if (!user) {
                spam.addSpam(req,res);
                return res.json({"_state": "incorrect_username"});
            }
            req.logIn(user, function(err) {
            if (err) { return next(err); }
                jwtTokens.createJwt(req, function(token){
                    const cookieAge = 1000 * 60 * 60 * 24 * 365;
                    res.cookie(jwtTokens.jwtOptions.cookieName, token, { maxAge: cookieAge, httpOnly: true, secure: true });
                    return res.json({"_state": "user_connected"});
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



