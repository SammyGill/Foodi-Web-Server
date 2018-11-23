/** Middleware to check Facebook access token **/
const request = require('request');

module.exports = (req, res, next) => {
  
  const access_token = req.headers.authorization.split(" ")[1];
  const url = "https://graph.facebook.com/me?fields=first_name,last_name,id,picture&access_token=";

  const options = {
    method: 'get',
    json: true,
    url: url + access_token
  }
  request(options, (err, response, body) => {
    if (err) {
      console.log(err);
      res.status(err.error.code).json(err);
    }
    req.userData = body;
    next();
  });
}

//https://graph.facebook.com/me?fields=name,picture&access_token={accesstoken}
