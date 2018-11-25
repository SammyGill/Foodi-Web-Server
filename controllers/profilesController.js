require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE user_id = ?";
const checkUsersExistsQuery = "SELECT * FROM users WHERE user_id = ? OR user_id=?";

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

function checkFollowingTable (follower_id, followee_id, cb) {
  const query = `SELECT * FROM following WHERE follower_id=? AND followee_id=?`;
  mysql.query(query, [follower_id, followee_id], (err, result) => {
    (err)? cb(err, -1) : cb(err, result);
  })
}

/** Function to follow a user
 */
exports.follow = (req, res) => {
  const user_id = req.userData.id;
  const followee_id = req.params.followee_id;

  mysql.query(checkUsersExistsQuery, [user_id, followee_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }

    if (result.length == 0) { // user(s) doesn't exist
      res.status(404).json( {message: "User(s) doesn't exist"} );
    }
    else { // user exists
      const checkFollowExists = `SELECT * FROM following WHERE follower_id=? AND followee_id=?`;
      mysql.query(checkFollowExists, [user_id, followee_id], (err, result) => {
        if (err) {
          res.status(500).json(err);
          throw err;
        }

        if (result.length != 0) { // already followed
          res.status(409).json( {message: "Already followed this user"} );
        }
        else { // haven't followed this user before'
          const followQuery = "INSERT INTO following (follower_id, followee_id) VALUES (?, ?)";
          mysql.query(followQuery, [user_id, followee_id], (err, result) => {
            (err)? res.status(500).json(err) : res.status(200).json( {message: "Followed"} );
          });
        }
      });
    }
  });
}

/** Function to unfollow a user
 */
exports.unfollow = (req, res) => {
  const user_id = req.userData.id;
  const unfollowee_id = req.params.unfollowee_id;

  mysql.query(checkUsersExistsQuery, [user_id, unfollowee_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }

    if (result.length == 0) { // user(s) doesn't exist
      res.status(404).json( {message: "User(s) doesn't exist"} );
    }
    else { // user exists
      const followQuery = "DELETE FROM following WHERE follower_id=? AND followee_id=?";
      mysql.query(followQuery, [user_id, unfollowee_id], (err, result) => {
        (err)? res.status(500).json(err) : res.status(200).json( {message: "Unfollowed"} );
      });
    }
  });
}


/** Function for getting all of the user's activities
 */
exports.get_activities = (req, res) => {
  const user_id = req.params.user_id;
  res.end("get activities for profile "+ user_id);
}
