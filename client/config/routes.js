const config = require("../../config");
const express = require("express");
const router = express.Router();
let fs = require("fs");
const logger = require("../config/logger");
const rp = require("request-promise");


removeParam = function (key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        z = 0,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
            z++;
        }
        if (z != 1) {
            rtn = rtn + "?" + params_arr.join("&");
        }
    }
    return rtn;
};


// Language switcher
router.get("/*", function (req, res, next) {
    let languages = ["en", "fr"];
    if (req.query.l) {
        if (languages.indexOf(req.query.l) > -1) {
            if (req.cookies.lang != req.query.l) {
                res.cookie("lang", req.query.l, {
                    expires: new Date(Date.now() + 99999999999),
                    httpOnly: true,
                    secure: true
                });
                logger.log("Language switched");
            }
        }
        res.redirect(302, removeParam("l", req.originalUrl));
    } else {
        next();
    }
});

router.get("/", function (req, res, next) {
    res.render("index.ejs", {title: "Express"});
    logger.log("Current session = " + req.session.id);
});

var getUser = function (req, res, next) {
    logger.debug(req.cookies[config.user_cookie_name]);
    return new Promise(function (done, reject) {
        rp({
            uri: "https://api.loocalhost.tk/connexion",
            headers: {
                "Authorization": "JWT "+req.cookies[config.user_cookie_name]
            },
            json: true
        }).then(function (user) {
            logger.success("User found");
            req.user = user;
            return next();
        }).catch(function (err) {
            reject(new Error(err));
        });
    });
};

router.get("/profile", getUser, function (req, res) {
    res.render("profile.ejs", {user: req.user});
});


router.get("/login", function (req, res, next) {
    if(req.query[config.base64.encrypt("setCookie")]){
        res.cookie(config.user_cookie_name, req.query[config.base64.encrypt("setCookie")], {
            httpOnly: true,
            expires: new Date(Date.now() + 99999999999)
        });
        return res.redirect("/profile");
    }
    res.render("login.ejs");
});


router.get("/signup", function (req, res) {
    res.render("signup.ejs", {message: req.flash("registerMessage")});
});

/*
 router.get('/profile', jwtTokens.isConnected, function(req, res) {
 res.render('profile.ejs', { user: req.user });
 });
 */
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


module.exports = router;



