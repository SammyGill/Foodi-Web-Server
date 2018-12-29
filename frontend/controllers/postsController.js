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

/** Renders the page used for creating posts */
exports.create = (req, res) => {
  res.render('createPost');
}


exports.feed = (req, res) => {
  //console.log(req.cookies.accessToken);

  const host = 'http://' + req.headers.host;
  const path = "/api/profiles/get/feed"
  
  request.get({
    url: host+path, 
    'json' : true,
    headers: {
    'content-type' : 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer ' + req.cookies.accessToken
    },
  }, (err, response, body) => {
  //  console.log(body);
    if (response.statusCode == 400) //bad gateway error (token expired)
      res.render('loginPage');
    else if (err || response.statusCode >= 400) // server error or client error
      res.render('error', getErrorMessage(err, response));
    else
      res.render("homePage", {posts: body} );
  });
}
