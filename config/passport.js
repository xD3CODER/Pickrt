const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const configAuth = require('./auth');
const logger = require('./logger.js');
const data = require('./remotedata');
const jwtTokens = require ('../config/jwt-tokens');
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
let images = require("./config/images");

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use(new JwtStrategy(jwtTokens.jwtOptions, function (jwt_payload, next) {

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
      catch (err) {
          logger.debug(err);
      }

  }));



  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'email':  email }, function(err, user) {
        if (err)
            return done(err);
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          const newUser = new User();
          newUser.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    User.findOne({ 'email':  email }, function(err, user) {
      if (err)
          return done(err);
      if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));
      if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      return done(null, user);
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name', 'picture.type(large)'],
  },


  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'facebook.id': profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          const newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.lastname = profile.name.givenName;
          newUser.firstname = profile.name.familyName;
          newUser.email = (profile.emails[0].value || '').toLowerCase();
          data.image.facebook(profile.id, function (err, result) {
            if (err) logger.error(err);
            else logger.success(result);
            newUser.avatar = result;
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          });
        }
      });
    });
  }));


};

