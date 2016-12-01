var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var ejs = require('ejs');

var debug = require('debug');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var users = require('./routes/users');
var images = require('./config/images');
images.imageFromBase64(images.image, 'test2.jpg');
images.getThumbail("url", 'https://scontent.xx.fbcdn.net/t31.0-1/s720x720/13920081_1245509215511167_5250898292146486763_o.jpg', 'test.jpg', function (err) {
  if(err) console.error("Erreur lors de la création du fichier : "+err);
});


var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var app = express();

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
    url: 'mongodb://localhost:27017/database',
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

///////////////

module.exports = app;
