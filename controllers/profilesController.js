require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE user_id = ?";


/** Function for gettting all info related to the usert
 */
exports.get_info = (req, res) => {
  const user_id = req.params.user_id;
  mysql.query(checkUserExistsQuery, [user_id], (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else if (result.length == 1) { // found restaurant
      res.status(200).json( result[0] );
    }
    else {
      res.status(404).json( {"Not Found": "User with this ID does not exist"} );
    }
  });

}

/** Function to get all of the user's posts
 */
exports.get_posts = (req, res) => {
  const user_id = req.params.user_id;
  let getPostsQuery = "Select * FROM posts where author_id = ?";
  
  mysql.query(getPostsQuery, [user_id], (err, results) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else {
      res.status(200).json( results );
    }
  });
}


/** Function to edit profile
 */
exports.edit = (req, res) => {
  const user_id = req.params.user_id;
  res.end("edit profile");
}


/** Function to get all of the user's followers
 */
exports.get_followers = (req, res) => {
  let getFollowersQuery = "SELECT * FROM followers WHERE following = ?";
  mysql.query(checkUserExists, [/*something*/], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length != 1) {
      // user does not exist
    }
    else {
      // probably want to check if this is a valid user first
      mysql.query(getFollowersQuery, [/*something*/], (err, result) => {
        // process list
      })
    }
  })
}


/** Function for getting a list of people the user follows
 */
exports.get_following = (req, res) => {
  const user_id = req.params.user_id;
  let getFollowingQuery = "SELECT * FROM followers where username = ?";
  res.end('Not implemented');
}


/** Function to follow a user
 */
exports.follow = (req, res) => {
  const user_id = req.params.user_id;
  const follow_id = req.params.follow_id;

  let followQuery = "INSERT INTO following VALUES (?, ?))";

  res.end("follow user: " + follow_id);
}


/** Function to unfollow a user
 */
exports.unfollow = (req, res) => {
  const user_id = req.params.user_id;
  const unfollow_id = req.params.unfollow_id;

  let unfollowQuery = `DELETE FROM following WHERE user_id = ? AND user_following_id = ?`;
  res.end("unfollow user: " + unfollow_id);

}


/** Function for getting all of the user's activities
 */
exports.get_activities = (req, res) => {
  const user_id = req.params.user_id;
  res.end("get activities for profile "+ user_id);
}
