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
  res.sendFile(dir + "/views/loginPage.html")
})


/* new additions here */
const accountsRoute = require('./routes/accounts');
const postsRoute    = require('./routes/posts');
const profilesRoute = require('./routes/profiles');
const restaurantsRoute = require('./routes/restaurants');
const commentsRoute = require('./routes/comments');
const homepageRoute = require('./routes/homepage');

app.use('/api/accounts', accountsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/profiles', profilesRoute);
app.use('/api/restaurants', restaurantsRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/homepage', homepageRoute);

