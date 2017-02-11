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

var getUser = function (req, res, next) {
    return new Promise(function (done, reject) {
        rp({
            uri: "https://api.loocalhost.tk/user",
            headers: {
                "Authorization": "JWT eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODljYzM4NTU5MTI5ODU0MTMzZjM2MTYiLCJpYXQiOjE0ODY2NzY4NzcsImV4cCI6MTQ5OTYzNjg3N30.zCM0V_wgO0GvIHi2_j26jdUUGv0LolssfDluTmLXO11r9jtabfviFdjDYr7TD5w-hF6lrxYdiRHUYsse8aS1zg"
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


function decryptRequest(req, res, next) {
    let finalReq = {};
    for (var attributename in req.body) {
        finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(attributename))] =
            CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(req.body[attributename]));
    }
    req.body = finalReq;
    console.log(finalReq);
    next();
}

function e(array) {
    let finalReq = {};
    for (var attributename in array) {
        finalReq[CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(attributename))] =
            CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(array[attributename]));
    }

    return finalReq;
}


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

router.get("/auth/twitter", passport.authenticate("twitter"));

router.get("/auth/twitter/callback", passport.authenticate("twitter", {
    successRedirect: "/profile",
    failureRedirect: "/",
}));

router.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "/profile",
    failureRedirect: "/",
}));

module.exports = router;


