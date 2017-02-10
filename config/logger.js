/**
 * Created by xD3VHAX on 09/12/2016.
 */
"use strict";

var debug = require('debug');

var error = debug(' (SRV)[ERROR] ->'),
    log =   debug(' (SRV)[INFO] ->'),
    success = debug(' (SRV) [SUCCESS] ->'),
    debug = debug(' (SRV)[DEBUG] ->');

log.color = 3;
success.color = 2;
error.color= 1;
debug.color= 5;

module.exports = {
    error,
    log,
    success,
    debug,
};


