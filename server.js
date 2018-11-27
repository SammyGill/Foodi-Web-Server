/**
 *  Main Node.js file that runs our back end server.
 */

"use strict";

// Required modules
const http = require('http');
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({path: '../env_variables.env'});
const port = process.env.PORT || 3000;
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


const app = express();
/* Application routes management */
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


// Connect to AWS MySQL DB
mysql.connect((err) => {
  if(err) throw err;
  console.log("Connected to db");
})

// Middleware used to parse requests and serve photos
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use("/api/photos", express.static("photos"));

// Server runs on port 3000 but IP tables have been set to
// forward data going to port 80 to port 3000
app.listen(port, () => {
  console.log("Node server running on port " + port);
})



/** FOR TESTING W/ HTML; DELETE LATER; to frontend shit **/


// HTML pages for testing, remove when done
const viewsDir =  dir + "/views";
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

app.get('/restaurants/view-single', (req, res) => {
  res.sendFile(viewsDir + '/viewRestaurant.html');
})

app.get('/profiles/view-posts', (req, res) => {
  res.sendFile(viewsDir + '/viewPosts.html');
});

app.get('/posts/view', (req, res) => {
  res.sendFile(viewsDir + '/viewSinglePost.html');
});

app.get('/feed', (req, res) => {
  res.sendFile(viewsDir + '/homePage.html');
});



