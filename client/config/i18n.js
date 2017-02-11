/**
 * Created by xD3VHAX on 25/01/2017.
 */
const config = require("../../config.js");
const i18n = require("i18n");
const path = require("path");
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:["en", "fr"],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(__dirname, "../"+config.client.env+"/languages/ejs"),
    defaultLocale: "fr",
    autoReload: true,
    cookie: "lang",
    queryParameter: "lang"
});

module.exports = function(req, res, next) {
    i18n.init(req, res);
    res.locals.__ = res.__;
    let current_locale = i18n.getLocale();

    return next();
};