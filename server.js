"use strict";
const http = require('http');
const port = 3000;
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({path: '../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const app = express();

const checkUserExistsQuery = "SELECT * FROM users WHERE username = ?";


mysql.connect((err) => {
  if(err) throw err;
  console.log("Connected to db");
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(port, () => {
  console.log("Node server running on port " + port);
})

app.get('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
})

app.get('/getFollowers', (req, res) => {
  let getFollowersQuery = "SELECT * FROM followers WHERE following = ?";
  mysql.query(checkUserExists, [/*something*/], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length != 1) {
      // user does not exist
    }
    else {
      // probably want to check if this is a valid user first
      mysql.query(getFollowersQuery, [/*something*/], (err, result) => {
        // process list
      })
    }
  })
})

app.get('/getFollowing', (req, res) => {
  let getFollowingQuery = "SELECT * FROM followers where username = ?";
  res.end('Not implemented');
})


// POST routes below
/******************************************************************************/

app.post('/changepassword', (req, res) => {
  let getPasswordQuery = "SELECT password FROM users WHERE username = ?";
  mysql.query(checkUserExistsQuery, [req.body.username], (err, result) => {
    if(err) {
      throw err;
    }
    mysql.query(getPasswordQuery, [req.body.username], (err, result) => {
      if(result != req.body.oldPassword) {
        // IMPLEMENT FAIL
      }
      else {

      }
    })
  })
})

app.post('/createaccount', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let fullName = req.body.name;
  let insertQuery = "INSERT INTO users (username, password, name) VALUES (?, ?, ?)";
  mysql.query(checkUserExistsQuery,[req.body.username], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length == 1) {
      res.send("already a user created with this username");
    }
    else {
      mysql.query(insertQuery, [req.body.username, req.body.password. req.body.name], (err, result) => {
        if (err) throw err;
        res.send("Successfully added user");
      })
    }
  })

  // Probably going to need to change below appropriately
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
})

app.post('/login', (req, res) => {
  res.end('Not implemented');
})


/* new additions here */
const accountsRoute = require('./routes/accounts');
const postsRoute    = require('./routes/posts');
const profilesRoute = require('./routes/profiles');
const restaurantsRoute = require('./routes/restaurants');
const commentsRoute = require('./routes/comments');

app.use('/api/accounts', accountsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/profiles', profilesRoute);
app.use('/api/restaurants', restaurantsRoute);
app.use('/api/comments', commentsRoute);

