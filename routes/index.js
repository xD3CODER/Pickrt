const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../config/images');
let fs = require('fs');
const logger = require('../config/logger');
const jwtTokens = require ('../config/jwt-tokens');

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



router.post('/login',
    passport.authenticate('local-login'),
    function(req, res) {
        jwtTokens.createJwt(req, function(token){
             const cookieAge = 1000 * 60 * 60 * 24 * 365;
             res.cookie('jwt', token, { maxAge: cookieAge, httpOnly: true, secure: true });

            res.json({success: true, token: 'JWT ' + token});
        });

       //res.redirect('/profile');
    });


router.get('/restricted', jwtTokens.isConnected, function(req, res, err) {
    logger.debug(req.headers['X-Real-IP']);
    res.json({success: true, msg: 'Welcome in the member area !'+ req.user.local.password});
});



router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook'), function(req, res) {
    jwtTokens.createJwt(req, function(token){
        res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true, secure: true });
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



