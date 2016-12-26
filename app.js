const express = require('express');
const path = require('path');
let favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
let ejs = require('ejs');
const debug = require('debug');
let error = debug('app:error');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const routes = require('./routes/index');
const users = require('./routes/users');
const configDB = require('./config/database.js');
mongoose.connect(configDB.url);
let remote = require('./config/remotedata');
const app = express();
let print = require("./config/logger");
let images = require("./config/images");




/*
 Complete example of getting profil image

 var fileToCheck = "./sexy.jpg";
 images.checkIfFaceExist('file', fileToCheck, function(err ,res){
  if(err) {print.error(err); return}
  else{
    print.debug(res);
 remote.checkExplicit('file', fileToCheck, function(err, res){
          if(err){ print.error(err); return}
          print.debug(res.message);
          if (res.state==1){
 remote.checkEmotion('file', fileToCheck, function(err, res){
                  if(err){ print.error(err); return}
                  print.debug(res);
              });
 images.getProfile("file", fileToCheck, 'finalTest', function (err, res) {
                  if(err) {print.error("Erreurs lors de la création du fichier url : "+err); return;}
                  print.debug("Fichié de profil sauvegardé ! " + res);
              });
 images.getThumbail("file", fileToCheck, 'finalTest', function (err, res) {
                  if(err) {print.error("Erreurs lors de la création du fichier url : "+err); return;}
                  print.debug("Fichié thumbail sauvegardé ! " + res);
              });
          }
 else if (res.state == 3)
 {
 print.error("You are banned for porn");
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
app.use(function(req, res, next) {
    res.setHeader('charset', 'utf-8');
    next();
});
app.use('/', routes);
app.use('/users', users);



// Handling errors
app.use(function(req, res, next) {
    const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.enable('trust proxy');
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
