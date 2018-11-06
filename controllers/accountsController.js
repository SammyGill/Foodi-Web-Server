exports.test = (req, res) => {
  res.send("/api/accounts");
}

/** Function for signing up 
 */
exports.signup = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let fullName = req.body.name;
  let insertQuery = "INSERT INTO users (username, password, name) VALUES (?, ?, ?)";
  mysql.query(checkUserExistsQuery,[req.body.username], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length == 1) {
      res.send("already a user created with this username");
    }
    else {
      mysql.query(insertQuery, [req.body.username, req.body.password. req.body.name], (err, result) => {
        if (err) throw err;
        res.send("Successfully added user");
      })
    }
  })

  // Probably going to need to change below appropriately
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
}


/** Function for signing in 
 */
exports.signin = (req, res) => {
  res.end('Not implemented');
}


/** Function for signing out
 */
exports.signout = (req, res) => {
  res.end("signout");
}


/** Function for resetting passsword 
 */
exports.reset_password = (req, res) => {
  let getPasswordQuery = "SELECT password FROM users WHERE username = ?";
  mysql.query(checkUserExistsQuery, [req.body.username], (err, result) => {
    if(err) {
      throw err;
    }
    mysql.query(getPasswordQuery, [req.body.username], (err, result) => {
      if(result != req.body.oldPassword) {
        // IMPLEMENT FAIL
      }
      else {

      }
    })
  })
}

/** Function for deleting account
 */
exports.delete_account = (req, res) => {
  res.end("delete account");
}


