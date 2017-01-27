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
let Promise = require("bluebird");
mongoose.Promise = require('bluebird');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const routes = require('./routes/index');
const users = require('./routes/users');
const configDB = require('./config/database.js');
mongoose.connect(configDB.url);
const app = express();
let logger = require("./config/logger");
var i18n = require('./i18n');

/*
console.time("yolo");

let fileToCheck = "./sexy4.jpg";

images.checkIfFaceExist('file', fileToCheck)
    .then(function (result) {
        print.debug(result);
        return Promise.resolve(remote.checkExplicit('file', fileToCheck));
    })
    .then(function (result) {
        print.debug(result);
        if (result.state == 1) {
            remote.checkEmotion('file', fileToCheck).then(function (result) {
                print.debug(result);
            });

            images.getProfile("file", fileToCheck, 'finalTest').then(function (result) {
                print.debug(result);
            }).catch(function (e) {
                print.error("Erreurs lors de la création du fichier url : " + e);
            });

            images.getThumbail("file", fileToCheck, 'finalTest').then(function (result) {
                print.debug(result);
            });
        }
    })
    .error(function (e) {
        console.log("Error handler " + e)
    })
    .catch(function (e) {
        console.log("Catch handler " + e)
    });
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logging('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n);
app.use(session({
    secret: 'shhsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 600000},
    store: new MongoStore({
        url: configDB.url,
        //touchAfter: 24 * 3600,
        autoRemove: 'interval',
        autoRemoveInterval: 60
    })

}));




app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config/passport')(passport);
app.use(function (req, res, next) {
    res.setHeader('charset', 'utf-8');
    next();
});
app.use('/', routes);
app.use('/users', users);


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
