const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./../models/user');
const configAuth = require('./../config/auth');
const logger = require('./../config/logger.js');
const data = require('./remotedata');
let images = require("./images");
let Promise = require("bluebird");



module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });



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
    usernameField: 'login_adress',
    passwordField: 'login_password',
    passReqToCallback: false,
  },
      function(username, password, done) {
          User.findOne({ email: username }, function (err, user) {
              if (err) { return done(err); }
              if (!user) {
                  return done(null, false, { message: 'Incorrect username.' });
              }
              if (!user.validPassword(password)) {
                  return done(null, false, { message: 'Incorrect password.' });
              }
              return done(null, user);
          });
      }
  ));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name', 'gender', 'birthday'],
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
            logger.debug(profile);
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.lastname = profile.name.givenName;
            newUser.birth_date = new Date(profile._json.birthday).toISOString();;
            newUser.gender = profile.gender;
          newUser.firstname = profile.name.familyName;
          newUser.email = (profile.emails[0].value || '').toLowerCase();
            let url = null;
            let status = null;

            data.images.facebook(profile.id).then(function (res){
                url = res;
                return Promise.resolve(images.checkIfFaceExist('url', url));
            }).then(function(face){
                if (face == 1) {
                    logger.debug("face found :" + face);
                    data.checkEmotion('url', url).then(function (result) {
                        logger.debug(result);
                    });
                    images.getProfile("url", url, 'finalTest').then(function (result) {
                        logger.debug(result);
                    }).catch(function (e) {
                        logger.error("Erreurs lors de la création du fichier url : " + e);
                    });
                    images.getThumbail("url", url, 'finalTest').then(function (result) {
                        logger.debug(result);
                    });
                    status = "content_verified";
                }
                else if (face == 2)
                {
                    status = "too_far";
                }
                else if (face == 3)
                {
                    status = "no_face";
                }
            }).then(function () {
                logger.debug("all done");
                newUser.avatar.url = url;
                newUser.avatar.status = status;
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }) .error(function (e) {
                logger.error("Error handler " + e)
            })
                .catch(function (e) {
                    logger.error("Catch handler " + e)
                });
        }
      });
    });
  }));


};

