/**
 *  Main Node.js file that runs our back end server.
 */

"use strict";

// Required modules
const http = require('http');
const dir = __dirname;
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({path: __dirname + '/env_variables.env'});
const morgan = require('morgan');
const path = require('path');
const port = process.env.PORT || 3000;
const exphbs  = require('express-handlebars');
const cookieParser = require('cookie-parser');
const request = require('request');

const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


const app = express();

// Middleware used to parse requests, set default view, and serve static files
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('static'));
app.use("/api/photos", express.static("photos"));

/* Application routes management */
app.use('/api/accounts',    require('./rest_api/routes/accounts'));
app.use('/api/posts',       require('./rest_api/routes/posts'));
app.use('/api/profiles',    require('./rest_api/routes/profiles'));
app.use('/api/restaurants', require('./rest_api/routes/restaurants'));
app.use('/api/comments',    require('./rest_api/routes/comments'));
app.use('/api/dishes',      require('./rest_api/routes/dishes'));

/* Routes for frontend using Handlebars*/

// path / will go to either feed/home page if logged in or login page if not logged in
app.get('/', (req, res, next) => { 
  (!req.cookies.accessToken)? res.render('loginPage') : next();
}, require('./frontend/controllers/postsController').feed );

// get long lived token from FB and set that as cookie
app.post('/set-cookie', (req, res) => {
  const access_token = req.headers.authorization.split(" ")[1];
  let url = 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&';
  url += 'client_id=286717961952006&';
  url += 'client_secret=3fef44d9c36a378aae14056d859ac48b&';
  url += 'fb_exchange_token=' + access_token;
  request.get({url: url, json:true}, (err, response, body) => {
    if (err || response.statusCode >= 400) {
      res.status(response.statusCode).end(response.statusMessage);
    }
    else {
      res.cookie("accessToken" , body.access_token, {expire : new Date() + 9999});
      res.status(200).json({message: "Success"});
    }
  });
});

// for logging out; deletes all cookies and redirect back to login page
app.get('/logout', (req, res) => {
  Object.keys(req.cookies).forEach( e => res.clearCookie(e) );
  res.redirect('/');
});

app.get('/discover', (req, res) => { res.render('discover') } );
app.use('/posts', require('./frontend/routes/posts'));
app.use('/restaurants', require('./frontend/routes/restaurants'));
app.use('/profiles', require('./frontend/routes/profiles'));

// for testing cookie; delete later
app.get('/test-cookie', (req, res) => {
  res.status(200).json(req.cookies);
})

app.get("/test",(req, res) => {
  res.render("test");
})

// Connect to AWS MySQL DB
mysql.connect((err) => {
  if(err) throw err;
  console.log("Connected to db");
})

// Server runs on port 3000 but IP tables have been set to
// forward data going to port 80 to port 3000
app.listen(port, () => {
  console.log("Node server running on port " + port);
})

/*
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./cert.crt')
};


https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(443);
*/
