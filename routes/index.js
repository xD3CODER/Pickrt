const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../config/images');
let fs = require('fs');
const logger = require('../config/logger');




router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.info('Current session = ' + req.session.id);
});


router.get('/images', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.info('Current session = ' + req.session.id);

    images.getProfile("base64", images.image, 'user1', function (err, res) {
        if(err) logger.error("Erreurs lors de la création du fichier url : "+err);
        else logger.success("Fichié sauvegardé ! " + res);
    });
/*
  images.getThumbail("url", 'https://scontent.xx.fbcdn.net/t31.0-1/s720x720/13920081_1245509215511167_5250898292146486763_o.jpg', 'test.jpg', function (err, res) {
    if(err) console.error("Erreurs lors de la création du fichier url : "+err);
    else console.error("Fichié sauvegardé !" + res);
  });
  */
});






router.get('/vc', function(req, res, next) {

  res.render('index', { title: 'Express' });
});


router.post('/cookie', function(req, res) {
  const old = req.session.cookie.expires;
  req.session.cookie.maxAge = new Date(Date.now() + 3600000);
  res.send("old =" +old +"\r" +req.session.cookie.expires);
});

router.get('/login', function(req, res, next) {
    res.render('login.ejs', {message: req.flash('loginMessage')});

});

router.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('registerMessage') });
});

router.get('/profile', isLoggedIn, function(req, res) {
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

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));

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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
