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

app.post('/createaccount', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let fullName = req.body.name;
  let checkUserExistsQuery = "SELECT * FROM users WHERE username = '" + username + "'";
  let insertQuery = "INSERT INTO users (username, password, name) VALUES ('" + username + "', '" + password + "', '" + fullName + "')";
  mysql.query(checkUserExistsQuery, (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length == 1) {
      res.send("already a user created with this username");
    }
    else {
      mysql.query(insertQuery, (err, result) => {
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
  res.send({username: req.body.username, password: req.body.password});
})



/******************************************************************************/

app.post('/createaccount', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('To be implemented\n');
})

