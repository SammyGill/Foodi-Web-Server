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
  console.log(req.userData);
  const host = 'http://' + req.headers.host;
  const path = "/api/profiles/feed"
  let posts = [];
  request.get({url: host + path, json:true, headers: {"Authorization": 'Bearer '+req.cookies.accessToken}}, (err, response, body) => {
      console.log(body);
      for(let i = 0; i < body.length; i++) {
        let obj = {
          dish_name: body[i].dish_name,
          author: body[i].first_name + " " + body[i].last_name,
          date: body[i].date,
          image: body[i].picture_url,
          caption: body[i].caption
        }
        posts.push(obj);
      }
      
      console.log("finished feed request");
      console.log(posts);
      res.render("homePage", {posts: posts} );
  })

  
  
}