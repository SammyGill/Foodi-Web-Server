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
  const street_number = req.body.street_number; //street number
  const route = req.body.route;      //address
  const locality = req.body.locality; //city
  const administrative_area_level_1 = req.body.administrative_area_level_1; //state     
  const postal_code = req.body.postal_code;
  const hours = req.body.hours;

  mysql.query(checkRestaurantExistsQuery, [id], (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else if (result.length == 1) {
      res.status(409).json( {"Conflict": "This restaurant already exists"} );
    }
    else {
      const query = 
        `INSERT INTO restaurants 
         (restaurant_id, name, street_number, route, locality, administrative_area_level_1, postal_code, hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
         
      mysql.query(query, [id, name, street_number, route, locality, administrative_area_level_1, postal_code, hours], 
      (err, result) => {
        if (err) {
          res.status(500).json( {"Internal Service Error": err} );
          throw err;
        }
        res.status(201).json( {
          "Created": "Restaurant created",
          restaurant_id: id
        });
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
    res.status(500).json( {"Internal Service Error": err} );
  }
  else {
    res.status(200).json( results );
  }
 });

}

/** Functoin for gettting all info related to the restaurant
 */
exports.get_info = (req, res) => {
  const restaurant_id = req.params.restaurant_id;
  mysql.query(checkRestaurantExistsQuery, [restaurant_id], (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else if (result.length == 1) { // found restaurant
      body = result[0];
      
      const getPostsQuery = 
        `SELECT p.post_id, p.dish_name, p.author_id, p.caption, p.picture, 
                p.rating, p.date, p.likes, p.dislikes
         FROM posts p, restaurants r 
         WHERE p.restaurant_id=r.restaurant_id`;
      
      mysql.query(getPostsQuery, [restaurant_id], (err, results) => {
        let groupBy = function(xs, key) {
          return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        };
        let groupedByDishName = groupBy(results, 'dish_name')
        
        body.posts = groupedByDishName;
        body.dish_names = Object.keys(groupedByDishName);

        res.status(200).json( body );
      });
      
    }
    else {
      res.status(404).json( {"Not Found": "Restaurant with this ID does not exist"} );
    }    
  });
 
}

/** Function for getting a list of all dishes in a restaurant **/
exports.get_dish_list = (req, res) => {
  const restaurant_id = req.params.restaurant_id;
  
  const getPostsQuery = 
    `SELECT DISTINCT posts.dish_name 
     FROM posts, restaurants 
     WHERE posts.restaurant_id = restaurants.restaurant_id`;
  
  mysql.query(getPostsQuery, [restaurant_id], (err, results) => {
    res.status(200).json( {dish_names: results.map(e => e.dish_name)} );
  });
}
