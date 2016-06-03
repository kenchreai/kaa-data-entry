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

function validateToken(req, res, adminOnly, func) {
  jwt.verify(req.get('x-access-token'), key, function(err, decoded) {
    if (err || !decoded.isAdmin && adminOnly)
      res.status(403).send('Unauthorized to modify this resource');
    else if ((Date.now() - decoded.iat)/1000 > 86000)
      res.status(403).send('Token expired');
    else func();
  });
}

/*****************      routes     ********************/

app.post('/api/users', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({ username: username }, function(err, users) {
    if (err) res.send('error');
    if (users.length > 0)
      res.status(404).send('Username already taken');
    else {
      var hashedPassword = bcrypt.hashSync(password, 15);
      var user = new User({ username: username, password: hashedPassword, isAdmin: false });
      user.save(function(err, user) {
        if (err) res.send(err);
        var token = jwt.sign({
          isAdmin: user.isAdmin,
          username: user.username,
          iat: Date.now()
        }, key);
        res.send(token);
      });
    }
  });
});

app.get('/api/users', function(req, res) {
  validateToken(req, res, true, function() {
    User.find(function(err, users) {
      var usernames = users.map(function(user) {
        return user.username;
      });
      res.send(usernames);
    });
  });
});

app.post('/api/users/password', function(req, res) {
  validateToken(req, res, false, function() {
    var username = jwt.verify(req.get('x-access-token'), key).username;
    User.find({ username: username }, function(err, users) {
      var user = users[0];
      var oldPassword = req.body.oldPassword;
      var newPassword = req.body.newPassword;
      if (bcrypt.hashSync(oldPassword, user.password)) {
        user.password = bcrypt.hashSync(newPassword, 15);
        user.save(function(err, user) {
          res.send('Password updated');
        });
      } else res.status(400).send('Updating password failed');
    });
  });
});

app.post('/api/admins/:username', function(req, res) {
  validateToken(req, res, true, function() {
    User.find({ username: req.params.username }, function(err, users) {
      var user = users[0];
      user.isAdmin = true;
      user.save(function(err, user) {
        if (err) res.send('Error updating admin')
        else res.send('Updated admin');
      });
    });
  });
});

app.delete('/api/users', function(req, res) {
  validateToken(req, res, true, function() {
    User.find({ _id: req.query.id }, function(err, users) {
      users[0].remove(function(err) {
        res.send('User deleted');
      });
    });
  });
});

app.post('/api/token', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({ username: username }, function(err, users) {
    var user = users[0];
    if (err || !bcrypt.compareSync(password, user.password)) {
      res.status(400).send('Username or password do not match');
    } else {
      var token = jwt.sign({
        isAdmin: user.isAdmin,
        username: user.username,
        iat: Date.now()
      }, key);
      res.send(token);
    }
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
  validateToken(req, res, true, function() {
    var resource = {
      subject: req.query.resourceName,
      predicate: req.body.key,
      object: req.body.val
    };
    dbService.insert(resource, function(response) {
      res.send(response);
    });
  });
});

app.put('/api/entities/:resourceName', function(req, res) {
  validateToken(req, res, true, function() {
    var properties = req.body;
    dbService.updateDetail(req.params.resourceName, properties, function(response) {
      res.send(response);
    });
  });
});

app.delete('/api/entities/', function(req, res) {
  validateToken(req, res, true, function() {
    var triple = {
      subject: req.query.resourceName,
      predicate: req.body.key,
      object: req.body.value
    };
    dbService.deleteDetail(triple, function(response) {
      res.send(response);
    });
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
