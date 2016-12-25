const express = require('express');
const passport = require('passport');
const router = express.Router();
const images = require('../config/images');
let fs = require('fs');
const logger = require('../config/logger');
const User = require('../models/user');


const jwt = require('jsonwebtoken');

const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies && req.cookies['jwt']) {
        token = req.cookies['jwt'];
    }
    return token;
};

const jwtOptions = [];
jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeader(), cookieExtractor]);
jwtOptions.secretOrKey = 'secretpass';
const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
   try {
       User.findOne({'_id': jwt_payload._id}, function (err, user) {
           if (err) {
               logger.debug("Error");
               return next(err, false);
           }
           else if (user) {
               logger.debug("Found");
               next(null, user);
           }
           else {
               logger.debug("Not found");
               return next(null, false);
           }
       });
   }
   catch (err){
       logger.debug(err);
   }
});

passport.use(strategy);

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


router.post('/login',
    passport.authenticate('local-login'),
    function(req, res) {
        const payload = {};
        payload._id = req.user._id;
        logger.debug(payload);
        const token = jwt.sign(payload , jwtOptions.secretOrKey, { expiresIn: 60*60 , algorithm: 'HS512'});
        res.cookie('jwt',token, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true, secure: true });
        res.json({success: true, token: 'JWT ' + token});
       //res.redirect('/profile');
    });



/*
router.get('/restricted', passport.authenticate('jwt', { session: false}), function(req, res) {

    logger.log("checking...");
    const token = getToken(req.headers);
    if (token) {
        const decoded = jwt.decode(token, jwtOptions.secretOrKey);
                res.json({success: true, msg: 'Welcome in the member area !'+ decoded.local.email});

    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
})
*/



function aaz (req, res, next){

    jwt.verify(cookieExtractor(req), 'secretpass', function(err, decoded) {
        if (err) {
            logger.error(err);
            return next(err);
        }

    passport.authenticate('jwt', { session: false }, function(err, user, info) {
        console.log(cookieExtractor(req));
        if (err) {
            logger.error(err);
            return next(err);
        }
        if (!user) { return res.send("Redirect to login").end(); }
        req.user = user;
        next();
    })(req, res, next);

    });
}


router.get('/restricted', aaz, function(req, res, next) {
    logger.success('logged');
    res.json({success: true, msg: 'Welcome in the member area !'+ req.user});
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};





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
