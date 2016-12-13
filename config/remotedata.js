/**
 * Created by xD3VHAX on 09/11/2016.
 */

const rp = require('request-promise');
const S = require('string');
const oxford = require('project-oxford'),
    emotion = new oxford.Client('e4578efe8d664d70bb14f6361f48e0dd'),
    vision = new oxford.Client('adaafea50f804bf1afc4fb1ccd201bb7');
const logger = require('./logger');

function base64ToBinary(base64Data){
    return new Buffer(base64Data.replace(/data.*base64,/, ''), 'base64');
}

let emotionMessages =
    {
        "veryhappy": [
            "Wow, beautiful smile !",
            "You gonna win everything with a such smile !",
            "What a smile !"
        ],
        "happy": [
            "Gorgeous !",
            "You are beautiful !"
        ],
        "neutral": [
            "Smile, you are beautiful !",
            "Smile for a while !"
        ],
        "unhappy": [
            "You're not at a funeral !",
            "You look depressed ..."
        ],
        "disgusted":[
            "Are you disgusted?"
        ]
    };


function analyzeContent(jsonObject, callback)
{
    let result = {};
    // logger.debug(jsonObject.adult);
    if (jsonObject.adult.isAdultContent == true)
    {
        // ban user
        result = {
            "state" : 3,
            "message" : "you are banned for porn"
        }
    }
    else if((jsonObject.adult.racyScore > 0.5 && jsonObject.adult.adultScore > 0.15) || jsonObject.adult.racyScore > 0.8)
    {
        result = {
            "state" : 2,
            "message" : "Explicit content detected"
        }
    }
    else if(jsonObject.adult.racyScore > 0.5 && jsonObject.adult.adultScore < 0.15)
    {
        result = {
            "state" : 1,
            "message" : "Tu met tes atouts en avant dis donc"
        }
    }
    else
    {
        result = {
            "state" : 1,
            "message" : "Good content"
        }
    }
    callback(null, result);
}

    function analyseEmotion(jsonObject, callback)
    {
      // logger.debug(jsonObject);
        let anger= jsonObject[0].scores.anger;
        let contempt= jsonObject[0].scores.contempt;
        let disgust= jsonObject[0].scores.disgust;
        let fear= jsonObject[0].scores.fear ;
        let happiness= jsonObject[0].scores.happiness;
        let neutral= jsonObject[0].scores.neutral;
        let sadness= jsonObject[0].scores.sadness;
        let surprise = jsonObject[0].scores.surprise;
        let result;
        if (disgust > 0.3)
        {
             result = emotionMessages.disgusted[Math.floor(Math.random() * emotionMessages.disgusted.length)];
        }
        else if (sadness > 0.1 || neutral > 0.5)
        {
             result = emotionMessages.neutral[Math.floor(Math.random() * emotionMessages.neutral.length)];
        }
        else if (sadness > 0.4 || neutral > 0.8)
        {
             result = emotionMessages.unhappy[Math.floor(Math.random() * emotionMessages.unhappy.length)];
        }
        else if (happiness > 0.6)
        {
             result = emotionMessages.veryhappy[Math.floor(Math.random() * emotionMessages.veryhappy.length)];
        }
        else
        {
             result = emotionMessages.happy[Math.floor(Math.random() * emotionMessages.happy.length)];
        }
        callback(null, result);
    }

let checkEmotion = function(method, image, callback){
    switch (method){
        case 'url' :
            emotion.emotion.analyzeEmotion({
                url: image
            }).then(function (response) {
                analyseEmotion(response, function(err, res){

                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
        case 'base64' :
            emotion.emotion.analyzeEmotion({
                data: base64ToBinary(image)
            }).then(function (response) {
                analyseEmotion(response, function(err, res){
                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
        case 'file' :
            emotion.emotion.analyzeEmotion({
                path: image
            }).then(function (response) {
                analyseEmotion(response, function(err, res){
                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
    }
};


let checkExplicit = function(method, image, callback){
    switch (method){
        case 'url' :
            vision.vision.analyzeImage({
                url: image,
                Adult : true
            }).then(function (response) {
                analyzeContent(response, function(err, res){
                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
        case 'base64' :
            vision.vision.analyzeImage({
                data: base64ToBinary(image),
                Adult : true
            }).then(function (response) {
                analyzeContent(response, function(err, res){
                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
        case 'file' :
            vision.vision.analyzeImage({
                path: image,
                Adult : true
            }).then(function (response) {
                analyzeContent(response, function(err, res){
                    callback(err, res);
                });
            }).catch(function(err){
                callback(err);
            });
            break;
    }
};


module.exports = {
    checkEmotion,
    checkExplicit,
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


