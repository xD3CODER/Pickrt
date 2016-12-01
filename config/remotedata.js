/**
 * Created by xD3VHAX on 09/11/2016.
 */

var rp = require('request-promise');

var S = require('string');

module.exports = {

    image : {
         facebook: function (user_id, callback) {
            rp({
                uri: 'https://graph.facebook.com/' + user_id + '/picture?redirect=false&height=650',
                json: true
            }).then(function (test) {
                if(S(test.data.url).count(".jpg")<1)
                {
                    callback("L'extension est mauvaise");
                }
                else
                {
                    callback(null, test.data.url);
                }

            }).catch(function (err) {
                callback(err)
            });
        }
    }

};


