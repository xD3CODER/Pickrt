/**
 * Created by xD3VHAX on 09/12/2016.
 */
"use strict";

const debugg = require("debug");

const error = debugg("   [ERROR] ->"),
    log = debugg("   [INFO] ->"),
    success = debugg("   [SUCCESS] ->"),
    debug = debugg("   [DEBUG] ->");

log.color = 3;
success.color = 2;
error.color = 1;
debug.color = 5;

module.exports = {
    error,
    log,
    success,
    debug,
};


