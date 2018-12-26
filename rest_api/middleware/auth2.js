
/** Middleware to check Facebook access token 
 *
 * Unlike the other auth middleware, the purpose of this middleware is solely
 * to extract the information from the access token, rather than to verify the
 * authenticity of the token. This middleware will be used in functions where the
 * verification of the user making the request will grant OPTIONAL administrative
 * abilities. This middleware will not throw an error.
 *
 * For example, when making a request to view the profile page, even if no
 * access token is passed in or the token is invalid, the data pertaining to
 * the requested profile--given that such a profile exists--will still be returned.
 * However, only when the profile owner (determined by comparing user id from the
 * token with the one in the db) makes the request will the option to perform
 * administrative tasks, such as edit, be presented.
 *
 * As such, all this middleware needs to do is extract the information from the
 * token and gives it to the controller, where the verification will be performed.
 */
const request = require('request');

module.exports = (req, res, next) => {
  let access_token = "";
  const auth = req.headers.authorization;

  // only attempt to grab the token if one is actually passed in
  if (auth) {
    const arr = auth.split(" ");
    access_token = (arr.length == 2)? arr[1] : "";
  }
 
  // From the Facebook Graph API, we are extracting the following
  // Facebook ID, First name, last name, Profile Picutre  
  const url = "https://graph.facebook.com/me?fields=first_name,last_name,id,picture.width(720)&access_token=";

  const options = {
    method: 'get',
    json: true,
    url: url + access_token
  }
  request(options, (err, response, body) => {
    if (response.statusCode == 200){ 
      body.picture.data.url = 'https://graph.facebook.com/'+body.id+'/picture?width=720';
      req.userData = body;
    }
    else
      req.userData = {};
    next();
  });
}
