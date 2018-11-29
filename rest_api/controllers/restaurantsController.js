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
    else if (result.length != 1) {
      res.status(404).json( {"Not Found": "Restaurant with this ID does not exist"} );
    }
    else { // found restaurant
      body = result[0];
      
      const getPostsQuery = 
        `SELECT p.post_id, p.dish_name, p.author_id, p.caption, p.picture, p.picture_url, 
                p.rating, p.date, p.likes, p.dislikes, p.likes - p.dislikes AS difference
         FROM posts p, restaurants r 
         WHERE p.restaurant_id=r.restaurant_id
         ORDER BY difference DESC`;

      mysql.query(getPostsQuery, [restaurant_id], (err, results) => { 
        // group posts by dish name, then sort dishes by median rating
        sortByRating(results, (dishes) => {
          body.dishes = dishes;
          body.most_popular = dishes[0].posts[0]; // most popular post of most popular food

          res.status(200).json( body );
        });

      });
      
    }
  });
 
}

// Helper function to sort dishes in dscending order by total rating
function sortByRating(results, cb) {
  
  // groups posts by dish name; not sorted, though
  let groupBy = (xs, key) => {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  let grouped = groupBy(results, 'dish_name')
  
  // function to find median
  const median = function(array) {
    array.sort(function(a, b) {
      return a - b;
    });
    var mid = array.length / 2;
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
  }

  let dishes = [];

  // count total rating for each dish
  Object.keys(grouped).forEach( dishName => {
    let totalRating = 0
    let ratings = []; // array of all rating; used to determine median
    grouped[dishName].forEach( post => {
      totalRating += post.rating;
      ratings.push( post.rating ); // push rating to array
    });
    
    dishes.push({
      name: dishName, 
      median_rating: median(ratings), 
      average_rating: +(totalRating / ratings.length).toFixed(2), 
      num_posts: ratings.length,
      posts: grouped[dishName]
    });

  });

  let sortBy = (p, a) => a.sort((i, j) => p.map(v => j[v] - i[v]).find(r => r))
  sortBy(['median_rating', 'num_posts', 'average_rating'], dishes);

  cb(dishes); // callback
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
