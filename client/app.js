const express = require('express');
const path = require('path');
let favicon = require('serve-favicon');
const logging = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
let ejs = require('ejs');
const debug = require('debug');
let error = debug('app:error');
let passport = require('passport');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const routes = require('./config/routes');
const app = express();
let logger = require("./config/logger");

var i18n = require('./config/i18n');

global.config = {
    port : 2096,
    env : 'dev'
};




app.set('views', path.join(__dirname, 'views/'+global.config.env));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, './'+global.config.env+'/images/favicon.png')));
app.use(logging('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, global.config.env)));
app.use(i18n);



app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./../controllers/passport')(passport);
app.use(function (req, res, next) {
    res.setHeader('charset', 'utf-8');
    next();
});
app.use('/', routes);




// Handling errors
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.enable('trust proxy');
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}


app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});


module.exports = app;