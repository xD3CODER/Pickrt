var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var debug = require('debug');
var error = debug('app:error');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var users = require('./routes/users');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
var remote = require('./config/remotedata');
var app = express();
var print = require("./config/logger");
var images = require("./config/images");




/*
 Complete example of getting profil image


var fileToCheck = images.image;
images.checkIfFaceExist('base64', fileToCheck, function(err ,res){
  if(err) {print.error(err); return}
  else{
    print.debug(res);
      remote.checkExplicit('base64', fileToCheck, function(err, res){
          if(err){ print.error(err); return}
          print.debug(res.message);
          if (res.state==1){
              remote.checkEmotion('base64', fileToCheck, function(err, res){
                  if(err){ print.error(err); return}
                  print.debug(res);
              });
              images.getProfile("base64", fileToCheck, 'finalTest', function (err, res) {
                  if(err) {print.error("Erreurs lors de la création du fichier url : "+err); return;}
                  print.debug("Fichié de profil sauvegardé ! " + res);
              });
              images.getThumbail("base64", fileToCheck, 'finalTest', function (err, res) {
                  if(err) {print.error("Erreurs lors de la création du fichier url : "+err); return;}
                  print.debug("Fichié thumbail sauvegardé ! " + res);
              });
          }
      });
  }
});
 */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'shhsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 },
  store:new MongoStore({
    db: 'express',
    host: 'localhost',
    url: 'mongodb://localhost:27017/databases',
    port: 27017,
    //touchAfter: 24 * 3600,
    autoRemove: 'interval',
    autoRemoveInterval: 60
  })


  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config/passport')(passport);

app.use('/', routes);
app.use('/users', users);



// Handling errors
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
