/** Middleware to check Facebook access token **/
const request = require('request');

module.exports = (req, res, next) => {
  const access_token = req.headers.authorization.split(" ")[1];
  const url = "https://graph.facebook.com/me?fields=first_name,last_name,id,picture.width(720)&access_token=";

  const options = {
    method: 'get',
    json: true,
    url: url + access_token
  }
  request(options, (err, response, body) => {
    
    if (response.statusCode != 200) {
      res.status(response.statusCode).json(body);
    }
    else {
      req.userData = body;
      next();
    }
  });
}

//https://graph.facebook.com/me?fields=name,picture&access_token={accesstoken}
