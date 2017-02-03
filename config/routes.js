const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../controllers/images');
let fs = require('fs');
const logger = require('../config/logger');
const jwtTokens = require ('../controllers/jwt-tokens');
const spam = require("./../controllers/spam");
var CryptoJS = require("crypto-js");

// Language switcher
router.get('/*', function (req,res,next) {
    let languages = ['en', 'fr'];
    if (req.query.l) {
        if (languages.indexOf(req.query.l) > -1) {
            if (req.cookies.lang != req.query.l) {
                logger.log("Cookie different");
                res.cookie('lang', req.query.l, { expires: new Date(Date.now() + 99999999999), httpOnly: true, secure: true });
            }
        }
    }
    next();
});

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

router.post('/signup',decryptRequest, passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));

function decryptRequest(req,res,next){
    let finalReq = {};
    for(var attributename in req.body){
        finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(attributename))] =
            CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(req.body[attributename]));
    }
    req.body = finalReq;
    console.log(finalReq);
    next();
}

function e(array){
    let finalReq = {};
    for(var attributename in array){
        finalReq[CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(attributename))] =
            CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(array[attributename]));
    }

    return finalReq;
}

router.post('/login',decryptRequest, spam.checkSpam,  function(req, res, next) {
    if(req.params.nextTest)
    {
        spam.addSpam(req,res);
        return res.json(e({"_spam" : req.params.nextTest, "_captcha" : req.params.needCaptcha}));
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
                return res.json(e({"_state": "user_notfound"}));
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



