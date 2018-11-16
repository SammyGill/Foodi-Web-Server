"use strict";
const http = require('http');
const port = process.env.PORT || 3000;
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({path: '../env_variables.env'});
const viewsDir = "/home/ubuntu/CSE-110-Server/views"

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

app.use("/api/photos", express.static("photos"));

app.listen(port, () => {
  console.log("Node server running on port " + port);
})

/** FOR TESTING W/ HTML; DELETE LATER; to frontend shit **/
const request = require('request');
app.get('/', (req, res) => {
  res.sendFile(dir + "/views/loginPage.html")
});

app.get('/homepage', (req, res) => {
  res.sendFile(viewsDir + "/homePage.html");
});


app.get('/signup', (req, res) => {
  res.sendFile(viewsDir + "/signupPage.html");
});

app.post('/signup', (req, res) => {
  const host = req.headers.origin;
  const path = '/api/accounts/signup';

  const options = {
    method: 'post',
    body: req.body,
    json: true,
    url: host + path
  }
  request(options, (err, response, body) => {
    if (err) {
      console.error('error posting json: ', err)
      throw err
    }
    const statusCode = response.statusCode;
    if ( statusCode != 201 )
      res.status(statusCode).json(body);
    else
      res.redirect("/homepage"); 
  });

});

app.post('/signin', (req, res) => {
  const host = req.headers.origin;
  const path = '/api/accounts/signin';

  const options = {
    method: 'post',
    body: req.body,
    json: true,
    url: host + path
  }
  request(options, (err, response, body) => {
    if (err) {
      console.error('error posting json: ', err)
      throw err
    }
    const statusCode = response.statusCode;
    if ( statusCode != 200 )
      res.status(statusCode).json(body);
    else
      res.redirect("/homepage"); 
  });
});


app.get('/posts/create', (req, res) => {
  res.sendFile(viewsDir + "/createPostPage.html");
});

app.get('/restaurants/create', (req, res) => {
  res.sendFile(viewsDir + '/createRestaurantPage.html');
});
/* new additions here */
const accountsRoute = require('./routes/accounts');
const postsRoute    = require('./routes/posts');
const profilesRoute = require('./routes/profiles');
const restaurantsRoute = require('./routes/restaurants');
const commentsRoute = require('./routes/comments');
//const homepageRoute = require('./routes/homepage');

app.use('/api/accounts', accountsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/profiles', profilesRoute);
app.use('/api/restaurants', restaurantsRoute);
app.use('/api/comments', commentsRoute);
//app.use('/api/homepage', homepageRoute);

