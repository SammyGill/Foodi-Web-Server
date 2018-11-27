require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkUserExistsQuery = "SELECT * FROM users WHERE user_id = ?";
const checkUsername = "SELECT * FROM users WHERE username=?";

/** Function for signing in 
 */
exports.signin = (req, res) => {
  const user_id = req.userData.id;
  
  mysql.query(checkUserExistsQuery, [user_id], (err, result) =>{
    if (err) {
      res.status(500).json({error: err} );
      throw err;
    }

    if ( result.length == 0 ) { // user doesn't exist; create user
      const fn = req.userData.first_name;
      const ln = req.userData.last_name;
      const pic = req.userData.picture.data.url;
      const username = fn + ln + user_id;
      let insertQuery = 
        `INSERT INTO users (user_id, first_name, last_name, profile_picture, username) 
         VALUES (?, ?, ?, ?, ?)`;
      mysql.query(insertQuery, [user_id, fn, ln, pic, username], (err, result) => {
        if (err) {
          res.status(500).json(err);
          throw err;
        }
        res.status(201).json({ message: "Account created", userData: req.userData });
      });
    }
    else { // user exists; login successful
      res.status(200).json( { message: "Login success", userData: req.userData });
    }
  });
}


/** Function for deleting account
 */
exports.delete_account = (req, res) => {
  res.end("delete account");
}

