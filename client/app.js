const config = require("../config.js");
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logging = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const passport = require("passport");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const flash = require("connect-flash");
const routes = require("./config/routes");
const app = express();
const i18n = require("./config/i18n");


app.set("views", path.join(__dirname, "views/" + config.server.env));
app.set("view engine", "ejs");
app.use(favicon(path.join(__dirname, "./" + config.server.env + "/images/favicon.png")));
app.use(logging(config.morgan_level));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, config.server.env)));
app.use(i18n);


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require("./../controllers/passport")(passport);
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
		res.render("error", {
			message: err.message,
			error: err,
		});
	});
}


app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render("error", {
		message: err.message,
		error: {},
	});
});


module.exports = app;