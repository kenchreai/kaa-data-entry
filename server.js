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


/***************** configure middleware ***************/

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

app.get('/api/entitylist', function(req, res) {
  dbService.query(req.query.domain, function(response) {
    res.send(response);
  });
});

app.get('/api/entities', function(req, res) {
  dbService.getDetail(req.query.resourceName, function(response) {
    res.send(response);
  });
});

app.post('/api/entities/:resourceName', function(req, res) {
  var properties = req.body;
  dbService.insert(req.params.resourceName, properties, function(response) {
    res.send(response);
  });
});

app.put('/api/entities/:resourceName', function(req, res) {
  var properties = req.body;
  dbService.updateDetail(req.params.resourceName, properties, function(response) {
    res.send(response);
  });
});

app.delete('/api/entities/:resourceName', function(req, res) {
  var properties = req.body;
  dbService.deleteDetail(req.params.resourceName, properties, function(response) {
    res.send(response);
  });
});

app.get('/api/descriptors', function(req, res) {
  dbService.getDescriptors(function(response) {
    res.send(response);
  });
});

app.get('*', function(req, res) {
  res.sendFile('/index.html');
});


/******************************************************/

http.listen(port, function() {
  console.log('listening on *:' + port);
});
