const http = require('http');
const port = 3000;
const dir = __dirname;
const express = require('express');
const app = express();

app.listen(3000, () => {
  console.log("Node server running on port 3000");
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

/******************************************************************************/

app.post('/createaccount', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('To be implemented\n');
})

