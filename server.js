"use strict";
const http = require('http');
const port = 3000;
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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
  res.json({result: "works"});
})



/******************************************************************************/

app.post('/createaccount', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('To be implemented\n');
})

