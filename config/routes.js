const config = require("../config");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const images = require("../controllers/images");
let fs = require("fs");
const logger = require("../config/logger");
const jwtTokens = require("../controllers/jwt-tokens");
const spam = require("./../controllers/spam");
var CryptoJS = require("crypto-js");


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



/*
 Check if user is connected
 */

router.get("/connexion", function (req, res) {
    let token = jwtTokens.headerExtractor(req);
    jwtTokens.isConnected(token).then(function (result) {
        logger.success(result);
        res.json(result);
    }).catch(function (e) {
        logger.error(e);
    });
});


router.get("/test", function (req, res) {
    res.json({test: "get"});
});


// Language switcher
router.get("/*", function (req,res,next) {
    let languages = ["en", "fr"];
    if (req.query.l) {
        if (languages.indexOf(req.query.l) > -1) {
            if (req.cookies.lang != req.query.l) {
                res.cookie("lang", req.query.l, { expires: new Date(Date.now() + 99999999999), httpOnly: true, secure: true });
                logger.log("Language switched");
            }
        }
        res.redirect(302, removeParam("l", req.originalUrl));
    }else {
        next();
    }
});

router.get("/", function(req, res, next) {
  res.render("index.ejs", { title: "Express" });
});

router.get("/vc", function(req, res, next) {
  res.render("index", { title: "Express" });
});


    router.get("/login", function(req, res, next) {

    res.render("login.ejs", {message: req.flash("loginMessage")});

});


router.get("/signup", function(req, res) {
  res.render("signup.ejs", { message: req.flash("registerMessage") });
});


router.get("/profile", jwtTokens.isConnected, function(req, res) {
  res.render("profile.ejs", { user: req.user });
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.post("/signup",decryptRequest, passport.authenticate("local-signup", {
  successRedirect: "/profile",
  failureRedirect: "/signup",
  failureFlash: true,
}));

function decryptRequest(req,res,next){
    let finalReq = {};
    for (var attributename in req.body) {
        finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(attributename))] =
            CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(req.body[attributename]));
    }
    req.body = finalReq;
    next();
}

function encryptRequest(array) {
    let finalReq = {};
    for (var attributename in array) {
        finalReq[CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(attributename))] =
            CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(array[attributename]));
    }

    return finalReq;
}

router.use(function(req, res, next) {
    res.json.crypt = function(response) {
        return res.json(config.encryptResponse(response));
    };
    next();
});


router.post("/login", config.decryptRequest, function (req, res, next) {
    if (req.params.nextTest) {
        spam.addSpam(req, res);
        return res.json.crypt({"_spam": req.params.nextTest, "_captcha": req.params.needCaptcha});
    }
    logger.debug(req.body.login_adress);
    passport.authenticate("local-login", function (err, user, info) {
        if (err) {
            return res.json(encryptRequest({"_error": err}));
        }
        if (info) {
            logger.error(info);
            return res.json.crypt({"_error": info});
        }
        if (!user) {
            spam.addSpam(req, res);
            return res.json.crypt({"_state": "user_notfound"});
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            jwtTokens.createJwt(req).then(function (token) {
                logger.success("/login => " + token);
                res.cookie("p_usr", token, {
                    httpOnly: true,
                    Path:"/",
                    domain: config.client.url,
                   expires: new Date(Date.now() + 99999999999)
                });
                res.json.crypt({_state: "user_connected", _cookie: token});

            }).catch(function (err) {
                logger.error("/login => " + err);
                return res.json.crypt({_state: "internal_error"});
            });
        });
    })(req, res, next);
});

router.get("/auth/facebook", function (req, res, next) {
    passport.authenticate("facebook", {scope: ["email", "user_birthday"]})(req, res, next);
    logger.debug("dsf");
});
router.get("/auth/facebook/callback", function (req, res, next) {
    passport.authenticate("facebook", function (err, user, info) {
        req.user = user;
        jwtTokens.createJwt(req).then(function (token) {
            logger.success("/auth/facebook/callback => " + token);
        //    res.send('<script>window.location = "http://loocalhost.tk/login?setCookie='+token+'";</script>');

             res.redirect("https://loocalhost.tk/login?setCookie="+token);

        }).catch(function (err) {
            logger.error("/login => " + err);
            return res.json.crypt({_state: "internal_error"});
        });
    })(req, res, next);
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



