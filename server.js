'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var path = require('path');
var env = require('dotenv').config();
var DbService = require('./dbService.js');

var username = process.env.KENCHREAI_USER;
var password = process.env.KENCHREAI_PASSWORD;
var dbService = DbService('http://kenchreai.org/kaa/', username, password);
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
});

app.use(express.static(__dirname + '/public'));


/*****************      routes     ********************/

app.post('/api/query', function(req, res) {
  var params = req.body;
  dbService.query(params, function(response) {
    res.send(response);
  });
});

app.post('/api/getdetail', function(req, res) {
  var resource = req.body.resource;
  console.log(resource);
  dbService.getDetail(resource, function(response) {
    res.send(response);
  });
});

app.get('/api/descriptors', function(req, res) {
  dbService.getDescriptors(function(response) {
    res.send(response);
  });
});

app.get('node_modules/jquery/dist/jquery.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/node_modules/jquery/dist/jquery.js'));
});

app.get('node_modules/spin/dist/spin.min.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/node_modules/spin/dist/spin.min.js'));
});

app.get(function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

/******************************************************/

http.listen(port, function() {
  console.log('listening on *:' + port);
});
