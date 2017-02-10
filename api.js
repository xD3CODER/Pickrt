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
const routes = require('./config/routes');
const configDB = require('./config/database.js');
mongoose.connect(configDB.url);
const app = express();

let logger = require("./config/logger");



app.set('views', path.join(__dirname, 'views/'+global.config.env));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, global.config.env, 'images/favicon.png')));
app.use(logging('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, global.config.env)));




app.use(passport.initialize());
require('./controllers/passport')(passport);
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
        res.json(err.message);
    });
}


app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json(err.message);
});


module.exports = app;