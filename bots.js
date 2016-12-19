var Twitter = require('twit');
var constants = require('./constants.js');
var fs = require("fs");
var path_twits = __dirname + '\\twits.txt';

// NO TOCAR. Puedes bloquear la cuenta. Max: 1 petición por minuto
var requestIntervalTime = 60000;

var Twitter = new Twitter({
    consumer_key: constants.auth.CONSUMER_KEY,
    consumer_secret: constants.auth.CONSUMER_SECRET,
    access_token: constants.auth.ACCESS_TOKEN_KEY,
    access_token_secret: constants.auth.ACCESS_TOKEN_SECRET,
});

////////////////////////////////////////////////////////////////////////////////
//// Utility functions
////////////////////////////////////////////////////////////////////////////////

// Se obtienen los mensajes a twitear de un fichero de texto
var getTwitsFromFile = function(callback) {
    // Coger los mensajes de un fichero
    // var nl = require('os').EOL;
    // var text = fs.readFileSync('/Mocabots/Mocabots/twits.txt', 'utf8');
    // var array = text.split(nl);
    // callback(array);
};

// Se obtienen los mensajes a twitear de una pagina de reddit
var getTwitsFromReddit = function(callback) {
    reddit = require('redwrap');
    var messages = [];
    reddit.r('ShortCleanFunny').sort('new').from('year').all(function(res) {
        res.on('data', function(data, res) {
            for (var i = 0; i < data.data.children.length; i++) {
              messages.push(data.data.children[i].data.title);
            }
            console.log('Datos cogidos de reddit (%d)', data.data.children.length);
            callback(messages);
        });
        res.on('error', function(e) {
            console.log('Error when accessing Reddit: %s', e); //outputs any errors
        });
    });
};

// Se obtienen los tweets a twitear
var getTwits = function(callback) {
  getTwitsFromReddit(callback);
};

////////////////////////////////////////////////////////////////////////////////
//// Twitter functions
////////////////////////////////////////////////////////////////////////////////

// Publicar el mensaje en Twitter
var postTweet = function(message) {
    Twitter.post('statuses/update', {
        status: message
    }, function(error, tweet, response) {
        if (error) {
            console.log(error);
        }
    });
};

// Obtiene las tendencias de la zona que se especifique en id
var getTrends = function(callback) {
    var trendsAvaliable = [];
    var params = {
        id: 23424977 //24865675 Europa
    };
    Twitter.get('trends/place', params, function(err, data) {
        if (!err) {
            var trends = data[0].trends;
            for (var i = 0; i < trends.length; i++) {
                trendsAvaliable.push(trends[i].name);
            }
            callback(trendsAvaliable);
        } else {
            console.log('Error in getTrends:', err);
            return [];
        }
    });
};

// Busca el último tweet que contiene la tendencia 'trend' y lo retweetea
// Ej: trend = '#nodejs'
var retweet = function(trend) {
    var params = {
        q: trend, // REQUIRED
        result_type: 'recent',
        lang: 'en'
    };

    // for more parametes, see: https://dev.twitter.com/rest/reference/get/search/tweets
    Twitter.get('search/tweets', params, function(err, data) {
        if (!err) {
            var retweetId = data.statuses[0].id_str;

            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (err) {
                    console.log('Error when RETWEETING', err);
                }
            });
        } else {
            console.log('Error when SEARCHING...', err);
        }
    });
};

// Obtiene las tendencias de Twitter y genera mensajes conteniendo algunas
var generateTwits = function(callback) {
    var twitts = [];
    getTwits(function(twit_message) {
        getTrends(function(trends) {

            for (var i = 0; i < trends.length; i++) {
                var rand_init = Math.floor(Math.random() * twit_message.length);
                var rand_trend = Math.floor(Math.random() * trends.length);
                // Generamos mensajes
                var message = twit_message[rand_init] + ' ' + trends[rand_trend];
                if (message.length > 140) {
                    message = message.substring(0, 139);
                }
                twitts.push(message);
            }
            callback(twitts, trends);
        });
    });
};

////////////////////////////////////////////////////////////////////////////////
//// Bot functions
////////////////////////////////////////////////////////////////////////////////

// Bots que interactuan con la API de Twitter
var startTweetbot = function() {

    generateTwits(function(twitts, trends) {
        console.log("trends(%d): %s...", trends.length, trends[0]);
        console.log("twitts(%d): %s...", twitts.length, twitts[0]);

        var postBotId = setInterval(function() {
            console.log("INIT postBot");
            if (twitts.length > 0) {
                var rand_init = Math.floor(Math.random() * twitts.length);
                postTweet(twitts[rand_init]);
                console.log('Message: ', twitts[rand_init]);
            }
        }, requestIntervalTime * 2);

        var retweetBotId = setInterval(function() {
            console.log("INIT retweetBot");
            if (trends.length > 0) {
                var rand_trends_init = Math.floor(Math.random() * trends.length);
                retweet(trends[rand_trends_init]);
                console.log('Trend: ', trends[rand_trends_init]);
            }
        }, requestIntervalTime * 5);

        var trendsBotId = setInterval(function() {
            console.log("INIT generateBot");
            generateTwits(function(tw, tr) {
                twitts = tw;
                trends = tr;
            });
        }, requestIntervalTime * 10);

        return [trendsBotId, postBotId, retweetBotId];
    });

};

// Parar bots
var stopBots = function(botIds) {
    for (var i = 0; i < botIds.length; i++) {
        if (botIds[i]) {
            clearInterval(botIds[i]);
        }
    }
};

// Se exportan las funciones de los bots
exports.startTweetbot = startTweetbot;
exports.stopBots = stopBots;
