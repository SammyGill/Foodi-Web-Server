/*
exports.[function_name] = (req, res) => {

}
*/

exports.getFollowers = (req, res) => {
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

exports.getFollowing = (req, res) => {
  let getFollowingQuery = "SELECT * FROM followers where username = ?";
  res.end('Not implemented');
}
