/**
 *  Accounts controller is used to process requess sent to the accounts
 *  portion of the API. The main responsibility for this controller is
 *  to help manage accounts in terms of creating them, signing in, etc.
 */

require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE user_id = ?";


/** 
 * signup takes user data and attempts to create a user with the provided
 * data. If the user already exists in the database, then an error is sent
 * back. Otherwise, we create an entry in the "users" table with the 
 * provided information and return success.
 *
 * req.body.username:
 * req.body.password:
 *
 */
exports.signup = function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const fullName = req.body.name;
  
  mysql.query(checkUserExistsQuery, [username], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length == 1) {
      res.status(409).json( {"Conflict": "This username already exist"} );
    }
    else {      
      let insertQuery = "INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)";
      mysql.query(insertQuery, [username, password, fullName], (err, result) => {
        if (err) {
          res.status(500).json( {"Internal Service Error": err} );
          throw err;
        }
        res.status(201).json( {"Created": "Account created"} );
      });
    }
  });

}


/** 
 *  signin helps users sign into the application. Since we are not
 *  managing the actual account creation or authentication 
 *  (we leave this for Facebook to handle), we must only keep
 *  track of unique users based off of a Facebook Access Token.
 *  If a user already exists with the particular access token,
 *  then we return success. If the user does not exist, we create
 *  an entry in the database with the provided information. We leave
 *  access token validation for our auth middleware.
 */
exports.signin = (req, res) => {
  const user_id = req.userData.id;
  
  mysql.query(checkUserExistsQuery, [user_id], (err, result) =>{
    if (err) {
      res.status(500).json({error: err} );
      throw err;
    }
    // user doesn't exist; create user
    if ( result.length == 0 ) {
      const fn = req.userData.first_name;
      const ln = req.userData.last_name;
      const pic = req.userData.picture.data.url;

      let insertQuery = 
        `INSERT INTO users (user_id, first_name, last_name, profile_picture) 
         VALUES (?, ?, ?, ?)`;

      mysql.query(insertQuery, [user_id, fn, ln, pic], (err, result) => {
        if (err) {
          res.status(500).json( {"Internal Service Error": err} );
          throw err;
        }
        res.status(200).json({ OK: "Login success", userData: req.userData });
      });
    }

    // user exists; login successful
    else {       
      res.status(200).json( { OK: "Login success", userData: req.userData });
    }
  });
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
      if(result[0].password != req.body.oldPassword) { // old password incorrect
        res.status(401).json( {"Unauthorized": "Incorrect password"} );
      }
      else { // old password corrrect
        if (req.body.newPassword1 != req.body.newPassword2) {
          res.status(422).json( {"Unprocessable Entity": "New passwords don't match; try again'"} );
        }
        else { // new passwords match
          const password = req.body.newPassword1;
       	  let updatePasswordQuery = `UPDATE users SET password='`+password+`'
                                     WHERE username=?`;
          mysql.query(updatePasswordQuery, [req.body.username], (err) => {
          (err)?
            res.status(500).json( {"Internal Service Error": err} ) :
            res.status(200).json( {"Success": "Password changed"} ); 
          }); 
        }
      }

    });
  });

}

/** Function for deleting account
 */
exports.delete_account = (req, res) => {
  res.end("delete account");
}

/**
 * allow user to change username if 
 * username is not taken
 */
exports.change_username = (req, res) => {
  red.end("change usernmae");
}


