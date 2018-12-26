/** Middleware to check Facebook access token **/
const request = require('request');

module.exports = (req, res, next) => {
  const access_token = req.headers.authorization.split(" ")[1];
 
  // From the Facebook Graph API, we are extracting the following
    // Facebook ID, First name, last name, Profile Picutre  
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
      body.picture.data.url = 'https://graph.facebook.com/'+body.id+'/picture?width=720';
      req.userData = body;
      next();
    }
  });
}
