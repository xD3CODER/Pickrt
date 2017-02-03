/**
 * Created by xD3VHAX on 25/01/2017.
 */
var i18n = require('i18n');

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'fr'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/../dev/languages/ejs',
    defaultLocale: 'fr',
    autoReload: true,
    cookie: 'lang',
    queryParameter: 'lang'
});

module.exports = function(req, res, next) {
    i18n.init(req, res);
    res.locals.__ = res.__;
    var current_locale = i18n.getLocale();

    return next();
};