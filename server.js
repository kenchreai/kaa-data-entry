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
var jwt = require('jsonwebtoken');
var key = process.env.SIGNING_KEY;
var mongoKey = process.env.MONGODB_URI;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

/****************** configure database ****************/

mongoose.connect(mongoKey);
var db = mongoose.connection;
var User;

db.once('open', function() {
  var userSchema = mongoose.Schema({
    username: String,
    password: String,
    isAdmin: Boolean
  });

  User = mongoose.model('User', userSchema);
});

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

function validateToken(token) {
  jwt.verify(token, key, function(err, decoded) {
    console.log(decoded);
  });
}

/*****************      routes     ********************/

app.post('/api/users', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({ username: username }, function(err, users) {
    if (err) res.send('error');
    if (users.length != 0) {
      res.status(404).send('Username already taken');
      return;
    }
    var hashedPassword = bcrypt.hashSync(password, 15);
    var user = new User({ username: username, password: hashedPassword, isAdmin: false });
    user.save(function(err, user) {
      if (err) res.send(err);
      res.send(user);
    });
  });
});

app.post('/api/token', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({ username: username }, function(err, users) {
    if (users.length !== 1) {
      res.status(400).send('Username or password do not match');
      return;
    }

    var user = users[0];

    if (err || !bcrypt.compareSync(password, user.password)) {
      res.status(400).send('Username or password do not match');
      return;
    }

    var token = jwt.sign({
      isAdmin: user.isAdmin,
      iat: Date.now()
    }, key);

    res.send(token);
  });
});

app.get('/api/entitylist', function(req, res) {
  dbService.query(req.query.domain, function(response) {
    res.send(response);
  });
});

app.get('/api/uris', function(req, res) {
  dbService.getAllUris(function(response) {
    res.send(response);
  });
});

app.get('/api/entities', function(req, res) {
  dbService.getDetail(req.query.resourceName, function(response) {
    res.send(response);
  });
});

app.post('/api/entities/', function(req, res) {
  var resource = {
    subject: req.query.resourceName,
    predicate: req.body.key,
    object: req.body.val
  };
  dbService.insert(resource, function(response) {
    res.send(response);
  });
});

app.put('/api/entities/:resourceName', function(req, res) {
  var properties = req.body;
  dbService.updateDetail(req.params.resourceName, properties, function(response) {
    res.send(response);
  });
});

app.delete('/api/entities/', function(req, res) {
  var triple = {
    subject: req.query.resourceName,
    predicate: req.body.key,
    object: req.body.value
  };
  dbService.deleteDetail(triple, function(response) {
    res.send(response);
  });
});

app.get('/api/descriptors', function(req, res) {
  dbService.getDescriptors(function(response) {
    res.send(response);
  });
});

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


/******************************************************/

http.listen(port, function() {
  console.log('listening on *:' + port);
});
