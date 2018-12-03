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


/* View profile page */
exports.view = (req, res) => {
  const host = 'http://' + req.headers.host;
  const path = '/api/profiles/' + req.params.username;
  const url =  host + path;

  request.get({url: url, json: true, headers: {
    'content-type' : 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer ' + req.cookies.accessToken
    },}, (err, response, body) => {
      console.log(body)
    // server error or client error
    if (err || response.statusCode >= 400) {
      res.render('error', getErrorMessage(err, response));
    }
    // successful api call
    else {
      user_info = body.user_info[0];
      console.log("follower count " + user_info.follower_count);
      console.log("following count " + user_info.following_count)
      res.render('profile', {
        user_id: user_info.user_id,
        username: user_info.username,
        name: user_info.first_name + ' ' + user_info.last_name,
        picture: user_info.profile_picture,
        following_count: user_info.following_count,
        follower_count: user_info.follower_count,
        posts: body.posts,
        is_following: body.isFollowing
      });
    }

  });
}

/* View all of the user's posts */
exports.view_posts = (req, res) => {
  res.render('viewPosts');
}
