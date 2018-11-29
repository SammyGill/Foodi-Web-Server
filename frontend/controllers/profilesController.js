const request = require('request');

/* View profile page */
exports.view = (req, res) => {
  const host = req.headers.host;
  const path = '/api/profiles/' + req.params.username;
  const url = 'http://' + host + path;
  
  request({
    method: 'GET',
    json: 'true',
    url: url
  },
  (err, response, body) => {
    if (err) {
      res.status(response.statusCode).json(err);
      throw err;
    }
    body = body.user_info[0];
    res.render('profile', {
      user_id: body.user_id,
      username: body.username,
      name: body.first_name + ' ' + body.last_name,
      picture: body.profile_picture
    });
  });
}

/* View all of the user's posts */
exports.view_posts = (req, res) => {
  res.render('viewPosts');
}
