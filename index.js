/*jshint esversion: 6 */
var express = require('express');
var path = require('path');
var Twitter = require('twitter');
var bots = require('./bots.js');
var app = express();

const PORT = 8080;

// Id del bot en curso
var activeBotId;

// -------------------------------------------------------
// Estáticos
// -------------------------------------------------------
app.use(express.static('public'));


// -------------------------------------------------------
// Routing
// -------------------------------------------------------

// Raíz
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


// Arrancar randombot
app.get('/bot/random/start', function(req, res) {
  activeBotId = bots.startRandombot();
  res.sendFile(path.join(__dirname + '/index.html'));
});

// Arrancar readbot
app.get('/bot/read/start', function(req, res) {

  bots.startReadbot().then(function(value) {
    activeBotId = value;
  });
  res.sendFile(path.join(__dirname + '/index.html'));
});

// Arrancar smartbot
app.get('/bot/reply/start', function(req, res) {
  activeBotId = bots.startReplybot();

  res.sendFile(path.join(__dirname + '/index.html'));
});

// Arrancar smartbot
app.get('/bot/retweet/start', function(req, res) {
	activeBotId = bots.startRetweetbot();

  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/bot/stop', function(req, res) {
  bots.stopBot(activeBotId);
	activeBotId = null;
  res.sendFile(path.join(__dirname + '/index.html'));
});

// -------------------------------------------------------
// Arranco el servidor
// -------------------------------------------------------

app.listen(PORT);
console.log("Servidor arrancado en puerto " + PORT);
