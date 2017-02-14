/**
 * Created by xD3VHAX on 11/02/2017.
 */
var CryptoJS = require("crypto-js");


var base64 = {
    encrypt : function (data) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
    },
    decrypt : function (data) {
        return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(data));
    }
};



function decryptRequest(req, res, next) {
    let finalReq = {};
    for (var attributename in req.body) {
        finalReq[base64.decrypt(attributename)] =
            base64.decrypt(req.body[attributename]);
    }
    req.body = finalReq;
    next();
}

function encryptResponse(array) {
    let finalReq = {};
    for (var attributename in array) {
        finalReq[base64.encrypt(attributename)] =
            base64.encrypt(array[attributename]);
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
    user_cookie_name : "p_usr",
	morgan_level : "dev",
    decryptRequest : decryptRequest,
    encryptResponse : encryptResponse,
    base64 : base64
};

module.exports = config;