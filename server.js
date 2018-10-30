"use strict";
const http = require('http');
const port = 3000;
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql').createConnection({
  host: "umamitest.cplid20zzr4i.us-west-1.rds.amazonaws.com",
  user: "sammygill98",
  password: "4simran1"
});
const app = express();

con.connect((err) => {
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

app.get('/createaccount', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('To be implemented\n');
})

app.post('/test', (req, res) => {
  console.log("received button request");
  res.send({username: req.body.username, password: req.body.password});
})



/******************************************************************************/

app.post('/createaccount', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('To be implemented\n');
})

