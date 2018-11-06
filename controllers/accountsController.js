require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE username = ?";


exports.test = (req, res) => {
  let query = `SELECT * from users`;
  mysql.query(query, (err, results) => {
  if (err) {
    res.status(500).json( {error: err} );
  }
  else {
    res.status(200).json(results);
  }
     
 });
}
/** Function for signing up 
 */
exports.signup = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const fullName = req.body.name;
  
  mysql.query(checkUserExistsQuery, [username], (err, result) => {
    if(err) {
      throw err;
    }
    else if(result.length == 1) {
      res.status(409).json( {error: "This username already exist"} );
    }
    else {      
      let insertQuery = "INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)";
      mysql.query(insertQuery, [username, password, fullName], (err, result) => {
        if (err) {
          res.status(500).json( {erorr: err} );
          throw err;
        }
        res.status(201).json( {message: "User created"} );
      });
    }
  });

}


/** Function for signing in 
 */
exports.signin = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  mysql.query(checkUserExistsQuery, [username], (err, result) => {
    if (err) {
      res.status(500).json( {error: err} );
      throw err;
    }

    if (result.length != 0) { // user exists
      (result[0].password == password)? 
        res.status(200).json( {message: "login successful" } ) :
        res.status(401).json( {error: "incorrect password"} );
    }
    else { // user doesn't exists
      res.status(404).json( {error: '\"'+username+'\" does not exist'} );
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
        res.status(401).json( {error: "incorrect password"} );
      }
      else { // old password corrrect
        if (req.body.newPassword1 != req.body.newPassword2) {
          res.status(422).json( {error: "new passwords don't match; try again'"} );
        }
        else { // new passwords match
          const password = req.body.newPassword1;
       	  let updatePasswordQuery = `UPDATE users SET password='`+password+`'
                                     WHERE username=?`;
          mysql.query(updatePasswordQuery, [req.body.username], (err) => {
          (err)?
            res.status(500).json( {error: err} ) :
            res.status(200).json( {message: "password changed"} ); 
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


