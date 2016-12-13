/**
 * Created by xD3VHAX on 09/12/2016.
 */

var debug = require('debug');

var error = debug('   [ERROR] ->'),
    log =   debug('   [INFO] ->'),
    success = debug('   [SUCCESS] ->'),
    debug = debug('   [DEBUG] ->');

log.color = 3;
success.color = 2;
error.color= 1;
debug.color= 5;


module.exports = {
    error,
    log,
    success,
    debug
};


