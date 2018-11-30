/**
 *  The profiles controller is responsible for managing all requests 
 *  associated with the profile of a user. This includes pulling a user's
 *  posts, updating their followers, etc.
 */

require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE user_id = ?";
const checkUsersExistQuery = "SELECT * FROM users WHERE user_id = ? OR user_id=?";
const checkIdOrUsername = "SELECT * FROM users WHERE user_id = ? OR username=?";
const checkUsername = "SELECT * FROM users WHERE username=?";


exports.username_list = (req, res) => {
  mysql.query("SELECT username AS label, user_id AS value FROM users", (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).json(result);
  })
};

exports.name_list = (req, res) => {
  mysql.query("SELECT first_name, last_name FROM users", (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).json(result)
  })
}
/** Function for gettting all info related to the usert
 */
exports.get_info = (req, res) => {
  const id = req.params.id_or_username;
  mysql.query(checkIdOrUsername, [id, id], (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else if (result.length == 1) { // found user
      const user_info = result;
      
      // get all of the user's posts
      let getPostsQuery = "Select * FROM posts where author_id = ?";
      mysql.query(getPostsQuery, [user_info[0].user_id], (err, results) => {
        if (err) {
          res.status(500).json( {"Internal Service Error": err} );
          throw err;
        }
        res.status(200).json({user_info: user_info, posts: results});
      });
    }
    else {
      res.status(404).json( {"Not Found": "User with this ID does not exist"} );
    }
  });

}

/** 
 *  get_posts returns all of the posts for a user. 
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

/**
 * allow user to change username if
 * username is not taken
 */
exports.set_username = (req, res) => {
  mysql.query(checkUsername, [req.body.username], (err, result) => {
    if (err) {
      res.status(500).json(err);
    }
    if (result.length == 0) {
      let setUsername = "UPDATE users SET username='" + req.body.username + "' WHERE user_id=?"
      mysql.query(setUsername, [req.userData.id], (err, result) => {
        if (err) {
          res.status(500).json(err);
          throw err;
        }
      console.log("valid username");
      res.status(200).json( {message: "Username set"} );
      });
    }
    else {
      console.log("invalid username");
      res.status(409).json( {message: "This username is already taken"} );
    }
  })
}

/** Function for getting all of the user's activities
 */
exports.get_activities = (req, res) => {
  const user_id = req.params.user_id;
  res.end("get activities for profile "+ user_id);
}


/** 
 *  get_following returns all of the other users that this user follow
 */
exports.get_following = (req, res) => {
  const user_id = req.params.user_id;
  const getFollowingQuery = "SELECT * FROM following where follower_id = ?";
  mysql.query(getFollowingQuery, [user_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).json( {following: result.map( e => e.followee_id )} );
  });
  
}

/** 
 *  get_following returns a list of users that follow this user
 */
exports.get_followers = (req, res) => {
  const user_id = req.params.user_id;
  const getFollowersQuery = "SELECT * FROM following where followee_id = ?";
  mysql.query(getFollowersQuery, [user_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).json( {followers: result.map( e => e.follower_id )} );
  })
  
}


/** 
 *  follow takes a user A, who wants to follow a user B, and updates the 
 *  followering and followers lists for these users appropriately so that
 *  user A now followers user B. If the user B does not exist, an error 
 *  is returned. If user A already follows user B, an error is returned as 
 *  well.
 */
exports.follow = (req, res) => {
  const user_id = req.userData.id;
  const followee_id = req.params.followee_id;

  mysql.query(checkUsersExistQuery, [user_id, followee_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }

    if (result.length != 2) { // user(s) doesn't exist
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
            if (err) {
              res.status(500).json(err);
              throw err;
            }

            const update = 'UPDATE users SET following_count=following_count+1 WHERE user_id=?';
            mysql.query(update, [user_id], (err, result) => {
              (err)? res.status(500).json(err) : res.status(200).json( {message: "Followed"} );
            })
          });
        }
      });
    }
  });
}


/** 
 *  follow takes a user A, who wants to unfollow a user B, and updates the 
 *  followering and followers lists for these users appropriately so that
 *  user A no longer followers user B. If the user B does not exist, an error 
 *  is returned. If user A already does not follow user B, an error is returned
 *  as well.
 */
exports.unfollow = (req, res) => {
  const user_id = req.userData.id;
  const unfollowee_id = req.params.unfollowee_id;

  mysql.query(checkUsersExistQuery, [user_id, unfollowee_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }

    if (result.length != 2) { // user(s) doesn't exist
      res.status(404).json( {message: "User(s) doesn't exist"} );
    }
    else { // user exists
      const followQuery = "DELETE FROM following WHERE follower_id=? AND followee_id=?";
      mysql.query(followQuery, [user_id, unfollowee_id], (err, result) => {
        if (err) {
          res.status(500).json(err);
          throw err;          
        }

        const update = 'UPDATE users SET following_count=following_count-1 WHERE user_id=?';
        mysql.query(update, [user_id], (err, result) => {
          (err)? res.status(500).json(err) : res.status(200).json( {message: "Unfollowed"} );
        })
      });
    }
  });
}

