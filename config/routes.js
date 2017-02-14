const config = require("../config");
const express = require("express");
const passport = require("passport");
const router = express.Router();
let fs = require("fs");
const logger = require("../config/logger");
const jwtTokens = require("../controllers/jwt-tokens");
const spam = require("./../controllers/spam");

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


router.post("/signup",config.decryptRequest, passport.authenticate("local-signup", {
  successRedirect: "/profile",
  failureRedirect: "/signup",
  failureFlash: true,
}));


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
            return res.json.crypt({"_error": err});
        }
        /*
        if (info) {
            logger.error(info.message);
            return res.json.crypt({"_state": info.message});
        }*/
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
                res.cookie(config.user_cookie_name, token, {
                    httpOnly: true,
                    Path:"/",
                    domain: config.client.url,
                   expires: new Date(Date.now() + 99999999999)
                });
                return res.json.crypt({_state: "user_connected", _cookie: token});

            }).catch(function (err) {
                logger.error("/login => " + err);
                return res.json.crypt({_state: "internal_error"});
            });
        });
    })(req, res, next);
});


/*
Facebook Login
 */

router.get("/auth/facebook", function (req, res, next) {
    passport.authenticate("facebook", {scope: ["email", "user_birthday"]})(req, res, next);
});
router.get("/auth/facebook/callback", function (req, res, next) {
    passport.authenticate("facebook", function (err, user, info) {
        req.user = user;
        jwtTokens.createJwt(req).then(function (token) {
            logger.success("/auth/facebook/callback => " + token);
        //    res.send('<script>window.location = "http://loocalhost.tk/login?setCookie='+token+'";</script>');

             res.redirect("https://loocalhost.tk/login?"+config.base64.encrypt("setCookie")+"="+token);

        }).catch(function (err) {
            logger.error("/login => " + err);
            return res.json.crypt({_state: "internal_error"});
        });
    })(req, res, next);
});
/*

router.get("/auth/twitter", passport.authenticate("twitter"));

router.get("/auth/twitter/callback", passport.authenticate("twitter", {
    successRedirect: "/profile",
    failureRedirect: "/",
}));
*/


module.exports = router;



