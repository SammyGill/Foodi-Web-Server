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

/** Function to view a post. Takes post_id as path parameter
  * Makes request to server to fetch information about the post and the the
  * comments associated with the post.
  */
exports.view = (req, res) => {
  const host = 'http://' + req.headers.host;
  let path = '/api/posts/' + req.params.post_id;
  let url = host + path;
  
  request.get({url: url, json: true}, (err, response, body) => {
    // server error or client error
    if (err || response.statusCode >= 400) {
      res.render('error', getErrorMessage(err, response));
    }
    // successfully api cal
    else {
      let obj = body;

      path = '/api/posts/' + req.params.post_id + '/comments';
      url = host + path;

      request.get({url: url, json: true}, (err, response, body) => {
        // server error or client error
        if (err || response.statusCode >= 400) {
          res.render('error', getErrorMessage(err, response));
        }
        // successful api call
        else {
          obj.comments = body;
          console.log(obj);
          res.render('viewPost', obj);
        }
        
      });
      
    }
  });
}

exports.feed = (req, res) => {
  console.log(req.cookies.accessToken);

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
    // server error or client error
    if (err || response.statusCode >= 400) {
      res.render('error', getErrorMessage(err, response));
    }

    else {
      res.render("homePage", {posts: body} );
    }
  });
}