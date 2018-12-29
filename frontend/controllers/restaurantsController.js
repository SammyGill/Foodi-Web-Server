const request = require('request');

/** function to determine the appropriate error messsage to render */
function getErrorMessage(err, response) {
  if (err) 
    throw err;
  return {
    statusCode: response.responseCode,
    message: (err)? err : response.statusMessage
  };
}


/** Function to view a restaurant. Takes restaurant_id as path parameter
  * Makes request to server to fetch information about the restaurant with
  * the given ID
  */
exports.view = (req, res) => {
  const host = 'http://' + req.headers.host;
  const path = '/api/restaurants/' + req.params.restaurant_id;
  const url = host + path;
  
  request.get({
    url: host+path, 
    'json' : true,
    headers: {
    'content-type' : 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer ' + req.cookies.accessToken
    },
  }, (err, response, body) => {
    // server error or client error
    if (err || response.statusCode >= 400) {
      res.render('error', getErrorMessage(err, response));
    }
    // successfully api cal
    else {
      console.log(body);
      res.render('viewRestaurant', body);
    }
  });
}
