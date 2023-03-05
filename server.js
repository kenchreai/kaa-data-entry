'use strict'
require('dotenv').config()
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const cors = require('cors')
const DbService = require('./dbService.js')
const express = require('express')
const http = require('http')
const jwt = require('jsonwebtoken')
const key = process.env.SIGNING_KEY
const mongoKey = process.env.MONGODB_URI
const mongoose = require('mongoose')
const dbPassword = process.env.KENCHREAI_PASSWORD
const path = require('path')
const port = process.env.PORT || 8080
const dbUsername = process.env.KENCHREAI_USER


/****************** initialise app ********************/


const app = express()
const dbService = DbService('http://kenchreai.org:3030/kaa_endpoint/', dbUsername, dbPassword)


/****************** configure database ****************/


mongoose.connect(mongoKey, { useNewUrlParser: true })
const db = mongoose.connection
let User

db.once('open', () => {
  const userSchema = mongoose.Schema({
    username: String,
    password: String,
    isAdmin: Boolean
  })
  User = mongoose.model('User', userSchema)
})


/***************** configure middleware ***************/

app.use(bodyParser.urlencoded({ extended:true }))
app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization')
  next()
})

const validateToken = (req, res, adminOnly, routeFunc) => {
  jwt.verify(req.get('x-access-token'), key, (err, decoded) => {
    if (err || !decoded.isAdmin && adminOnly) {
      res.status(403).send('Unauthorized to modify this resource')
    } else if ((Date.now() - decoded.iat)/1000 > 86000) {
      res.status(403).send('Token expired')
    } else {
      routeFunc()
    }
  })
}


/*****************      routes     ********************/

app.post('/api/users', (req, res) => {
  const username = req.body.username.toLowerCase()
  const password = req.body.password
  User.find({ username }, (err, users) => {
    if (err) res.send('error')
    if (users.length > 0)
      res.status(400).send('Username already taken')
    else {
      const hashedPassword = bcrypt.hashSync(password, 15)
      const user = new User({ username, password: hashedPassword, isAdmin: false })
      user.save((err, user) => {
        if (err) res.send(err)
        const token = jwt.sign({
          isAdmin: user.isAdmin,
          username: user.username,
          iat: Date.now()
        }, key)
        res.send(token)
      })
    }
  })
})

app.get('/api/users', (req, res) => {
  validateToken(req, res, true, () => {
    User.find((err, users) => res.send(users.map(u => u.username)))
  })
})

app.post('/api/reset', (req, res) => {
  validateToken(req, res, true, () => {
    User.find({ username: req.body.username }, (err, users) => {
      if (err) res.send('Couldn\'t find user')
      const user = users[0]
      user.password = bcrypt.hashSync(process.env.PASSWORD_RESET, 15)
      user.save((err, user) => {
        res.send('Password reset')
      })
    })
  })
})

app.put('/api/users/password', (req, res) => {
  validateToken(req, res, false, () => {
    const username = jwt.verify(req.get('x-access-token'), key).username
    User.find({ username }, (err, users) => {
      const user = users[0]
      const { oldPassword, newPassword } = req.body
      if (newPassword && bcrypt.compareSync(oldPassword, user.password)) {
        user.password = bcrypt.hashSync(newPassword, 15)
        user.save((err, user) => {
          if (err) res.status(500).send(err)
          res.send('Password updated')
        })
      } else {
        res.status(400).send('Updating password failed')
      }
    })
  })
})

app.post('/api/admins/', (req, res) => {
  validateToken(req, res, true, () => {
    User.find({ username: req.body.username }, (err, users) => {
      const user = users[0]
      user.isAdmin = true
      user.save((err, user) => {
        if (err) res.send('Error updating admin')
        else res.send('Updated admin')
      })
    })
  })
})

app.delete('/api/users/:id', (req, res) => {
  validateToken(req, res, true, () => {
    User.find({ _id: req.params.id }, (err, users) => {
      users[0].remove(err => res.send('User deleted'))
    })
  })
})

app.post('/api/token', (req, res) => {
  const username = req.body.username.toLowerCase()
  const password = req.body.password
  User.find({ username }, (err, users) => {
    const user = users[0]
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      res.status(400).send('Username or password do not match')
    } else {
      const token = jwt.sign({
        isAdmin: user.isAdmin,
        username: user.username,
        iat: Date.now()
      }, key)
      res.send(token)
    }
  })
})

app.get('/api/entitylist', (req, res) => {
  dbService.queryByDomain(req.query.domain, response => {
    res.send(response)
  })
})

app.get('/api/uris', (req, res) => {
  dbService.getAllUris(response => res.send(response))
})

app.get('/api/uriproperties', (req, res) => {
  dbService.getURIProperties(props => res.send(props))
})

app.get('/api/entities', (req, res) => {
  dbService.getDetail(req.query.resourceName, response => res.send(response))
})

app.post('/api/entities/:collection/:entity', (req, res) => {
  validateToken(req, res, true, () => {
    const resource = {
      subject: `${req.params.collection}/${req.params.entity}`,
      predicate: req.body.key,
      object: req.body.val
    }
    dbService.insert(resource, response => res.send(response))
  })
})

app.put('/api/entities/:collection/:entity', (req, res) => {
  validateToken(req, res, true, () => {
    const resource = {
      subject: `${req.params.collection}/${req.params.entity}`,
      predicate: req.body.predicate,
      oldObject: req.body.oldVal,
      newObject: req.body.newVal,
      data: req.body.data
    }
    if (req.body.predicate === 'kaaont:x-geojson') {
      dbService.updateMap(resource, response => res.send(response))
    } else {
      dbService.updateDetail(resource, response => res.send(response))
    }
  })
})

app.delete('/api/entities/:collection/:entity', (req, res) => {
  validateToken(req, res, true, () => {
    const triple = {
      subject: `${req.params.collection}/${req.params.entity}`,
      predicate: req.query.key,
      object: req.query.value
    }
    dbService.deleteDetail(triple, response => res.send(response))
  })
})

app.get('/api/descriptors', (req, res) => {
  dbService.getDescriptors(response => res.send(response))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})


/******************************************************/

const server = http.Server(app)
server.listen(port, () => console.log(`listening on port ${port}`))
