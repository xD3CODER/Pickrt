const config = require("./config");
const express = require("express");
const path = require("path");
const logging = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
require("./controllers/passport")(passport);
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const routes = require("./config/routes");
const configDB = require("./config/database.js");
mongoose.connect(configDB.url);
const app = express();


app.set("views", path.join(__dirname, "views/" + config.server.env));
app.set("view engine", "ejs");
app.use(logging(config.morgan_level));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, config.server.env)));
app.use(passport.initialize());


app.use(function (req, res, next) {
    res.setHeader("charset", "utf-8");
    next();
});
app.use("/", routes);


// Handling errors
app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
app.enable("trust proxy");
if (app.get("env") === "development") {
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