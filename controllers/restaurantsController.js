require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkRestaurantExistsQuery = "SELECT * FROM restaurants WHERE restaurant_id = ?";

/** Function for creating a restaurant
 */
exports.create_restaurant = (req, res) => {
  const name = req.body.name;
  const id = req.body.restaurant_id;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;
  const hours = req.body.hours;

  mysql.query(checkRestaurantExistsQuery, [id], (err, result) => {
    if (err) {
      res.status(500).json( {error: err} );
      throw err;
    }
    else if (result.length == 1) {
      res.status(409).json( {error: "This restaurant already exists"} );
    }
    else {
      const query = 
        `INSERT INTO restaurants 
         (restaurant_id, name, address, city, state, zip_code, hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`;
         
      mysql.query(query, [id, name, address, city, state, zip, hours], 
      (err, result) => {
        if (err) {
          res.status(500).json( {error: err} );
          throw err;
        }
        res.status(201).json( {message: "Restaurant created"} );
      })
    }    
  });
}

/** Function for getting all restaurant in the database
 */
exports.get_all_restaurants = (req, res) => {
  let query = `SELECT * from restaurants`;
  mysql.query(query, (err, results) => {
  if (err) {
    res.status(500).json( {error: err} );
  }
  else {
    res.status(200).json(results);
  }
 });

}

/** Functoin for gettting all info related to the restaurant
 */
exports.get_info = (req, res) => {
  const restaurant_id = req.params.restaurant_id;
  res.end("info for restaurant: " + restaurant_id);
}
