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
const morgan = require('morgan');
const path = require('path');
const port = process.env.PORT || 3000;
const exphbs  = require('express-handlebars');

const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


const app = express();

/* Application routes management */
const accountsRoute = require('./rest_api/routes/accounts');
const postsRoute    = require('./rest_api/routes/posts');
const profilesRoute = require('./rest_api/routes/profiles');
const restaurantsRoute = require('./rest_api/routes/restaurants');
const commentsRoute = require('./rest_api/routes/comments');

app.use('/api/accounts', accountsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/profiles', profilesRoute);
app.use('/api/restaurants', restaurantsRoute);
app.use('/api/comments', commentsRoute);

/* Routes for frontend using Handlebars*/
app.get('/', (req, res) => { res.render('loginPage') } );
app.get('/home', (req, res) => { res.render('homePage') } );
app.get('/discover', (req, res) => { res.render('discover') } );
app.use('/posts', require('./frontend/routes/posts'));
app.use('/restaurants', require('./frontend/routes/restaurants'));
app.use('/profiles', require('./frontend/routes/profiles'));


// Connect to AWS MySQL DB
mysql.connect((err) => {
  if(err) throw err;
  console.log("Connected to db");
})

// Middleware used to parse requests and serve photos
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('static'));
app.use("/api/photos", express.static("photos"));

// Server runs on port 3000 but IP tables have been set to
// forward data going to port 80 to port 3000
app.listen(port, () => {
  console.log("Node server running on port " + port);
})

const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./cert.crt')
};

/*
https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(443);
*/
