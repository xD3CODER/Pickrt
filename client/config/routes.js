const express = require("express");
const passport = require("passport");
const router = express.Router();
let fs = require("fs");
const logger = require("../config/logger");
var CryptoJS = require("crypto-js");
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
    console.info("Current session = " + req.session.id);

});

router.get("/vc", function (req, res, next) {
    res.render("index", {title: "Express"});
});

let cookieName = "p_usr";
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies && req.cookies[cookieName]) {
        token = req.cookies[cookieName];
    }
    return token;
};

var getUser = function (req, res, next) {
    logger.debug(req.cookies[cookieName]);
    return new Promise(function (done, reject) {
        rp({
            uri: "https://api.loocalhost.tk/connexion",
            headers: {
                "Authorization": "JWT "+req.cookies[cookieName]
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
    if(req.query.setCookie){
        res.cookie("p_usr", req.query.setCookie, {
            httpOnly: true,
            expires: new Date(Date.now() + 99999999999)
        });
        res.redirect("https://loocalhost.tk/profile");
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


router.get("/auth/facebook", passport.authenticate("facebook", {scope: ["email", "user_birthday"]}));

router.get("/auth/facebook/callback", passport.authenticate("facebook"), function (req, res) {
    jwtTokens.createJwt(req, function (token) {
        res.cookie(jwtTokens.jwtOptions.cookieName, token, {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            secure: true
        });
        res.redirect("/profile");
    });
    //res.redirect('/profile');
});


module.exports = router;



