/** Function to get all info related to the profile
 */
exports.get_info = (req, res) => {
  const profile_id = req.params.profile_id;
  res.end("get info for profile: " + profile_id);
}

/** Function to get all of the user's posts
 */
exports.get_posts = (req, res) => {
  const profile_id = req.params.profile_id;
  let getPostsQuery = "Select * FROM posts where author_id = ?";
  res.end("get posts for profile: " + profile_id);
}

/** Function to edit profile
 */
exports.edit = (req, res) => {
  const profile_id = req.params.profile_id;
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
  const profile_id = req.params.profile_id;
  let getFollowingQuery = "SELECT * FROM followers where username = ?";
  res.end('Not implemented');
}

/** Function to follow a user
 */
exports.follow = (req, res) => {
  const profile_id = req.params.profile_id;
  const follow_id = req.params.follow_id;

  let followQuery = "INSERT INTO following VALUES (?, ?))";

  res.end("follow user: " + follow_id);
}

/** Function to unfollow a user
 */
exports.unfollow = (req, res) => {
  const profile_id = req.params.profile_id;
  const unfollow_id = req.params.unfollow_id;

  let unfollowQuery = `DELETE FROM following WHERE user_id = ? AND user_following_id = ?`;
  res.end("unfollow user: " + unfollow_id);

}

/** Function for getting all of the user's activities
 */
exports.get_activities = (req, res) => {
  const profile_id = req.params.profile_id;
  res.end("get activities for profile "+ profile_id);
}
