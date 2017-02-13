/**
 * Created by xD3VHAX on 11/02/2017.
 */
var CryptoJS = require("crypto-js");
function decryptRequest(req, res, next) {
    let finalReq = {};
    for (var attributename in req.body) {
        finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(attributename))] =
            CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(req.body[attributename]));
    }
    req.body = finalReq;
    next();
}

function encryptResponse(array) {
    let finalReq = {};
    for (var attributename in array) {
        finalReq[CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(attributename))] =
            CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(array[attributename]));
    }
    return finalReq;
}



let config = {
	client : {
		port : 2096,
		env : "dev",
		url : "loocalhost.tk"
	},
	server : {
		port : 2087,
		env : "dev",
        url : "api.loocalhost.tk"
	},
	morgan_level : "dev",
    decryptRequest : decryptRequest,
    encryptResponse : encryptResponse
};

module.exports = config;