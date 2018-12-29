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
  const requester_uid = req.userData.id;
  const restaurant_id = req.params.restaurant_id;

  mysql.query(checkRestaurantExistsQuery, [restaurant_id], (err, result) => {
    if (err) {
      res.status(500).json( {message: err} );
      throw err;
    }
    else if (result.length != 1) {
      res.status(404).json( {message: "Restaurant with this ID does not exist"} );
    }
    else { // found restaurant
      body = result[0];

      const getPostsQuery = 
       `SELECT posts.post_id, posts.dish_name, posts.author_id, posts.caption, 
              posts.picture, posts.picture_url, posts.rating, posts.date, 
              posts.likes, posts.dislikes, posts.likes - posts.dislikes AS difference,
              users.username, users.profile_picture,
        CASE WHEN author_id = ? THEN true ELSE false END AS canEdit,
        CASE 
          WHEN EXISTS (SELECT 1 FROM likes 
            WHERE likes.user_id=? AND likes.post_id=posts.post_id AND likes.value=1)
          THEN true ELSE false END AS liked,
        CASE 
          WHEN EXISTS (SELECT 1 FROM likes 
            WHERE likes.user_id=? AND likes.post_id=posts.post_id AND likes.value=-1)
          THEN true ELSE false END AS disliked
         FROM posts
         INNER JOIN users ON users.user_id=posts.author_id 
         WHERE restaurant_id=?
         ORDER BY difference DESC`;

      mysql.query(getPostsQuery, [requester_uid, requester_uid, requester_uid, restaurant_id], (err, results) => { 
        
        // group posts by dish name, then sort dishes by median rating
        sortByRating(results, (dishes) => {
          body.dishes = dishes;
          
          // most popular post of most popular food
          body.most_popular = (dishes.length == 0)? {} : dishes[0].posts[0]; 

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
  const dish_name = req.query.dish;

  const query = `SELECT DISTINCT dish_name FROM posts WHERE dish_name LIKE '` + dish_name + `%'`;
  const getPostsQuery = 
    `SELECT DISTINCT posts.dish_name 
     FROM posts 
     WHERE posts.restaurant_id = ? AND dish_name LIKE '` + dish_name + `%'`;
  
  mysql.query(getPostsQuery, [restaurant_id], (err, results) => {
    res.status(200).json( {dish_names: results.map(e => e.dish_name)} );
  });
}

exports.discover = (req, res) => {
  const user_id = req.userData.id;
  const arr = req.query.restaurants.split(',');
  let query = 
  `SELECT DISTINCT 
    users.username, users.profile_picture, posts.*,
    restaurants.name AS restaurant_name,
    CASE WHEN author_id = ? THEN true ELSE false END AS canEdit,
    CASE 
      WHEN EXISTS (SELECT 1 FROM likes 
        WHERE likes.user_id=? AND likes.post_id=posts.post_id AND likes.value=1)
      THEN true ELSE false END AS liked,
    CASE 
      WHEN EXISTS (SELECT 1 FROM likes 
        WHERE likes.user_id=? AND likes.post_id=posts.post_id AND likes.value=-1)
      THEN true ELSE false END AS disliked
   FROM posts
   INNER JOIN users ON users.user_id=posts.author_id 
   INNER JOIN following ON posts.author_id=following.followee_id
   LEFT JOIN restaurants ON restaurants.restaurant_id=posts.restaurant_id
   WHERE `;
  
  for (let i = 0; i < arr.length; i++) {
    query += `posts.restaurant_id='` + arr[i] + `'`;
    if (i != arr.length - 1)
      query += ` OR `;
  }
  query += ` GROUP BY post_id ORDER BY post_id DESC`;

  mysql.query(query, [user_id, user_id, user_id], (err, results) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    
    // groups posts by dish name; not sorted, though
    let groupBy = (xs, key) => {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
    let grouped = groupBy(results, 'restaurant_id')
    Object.keys(grouped).forEach( restaurant => {
      grouped[restaurant] = groupBy(grouped[restaurant], 'dish_name');
    });

    let posts = [];
    Object.keys(grouped).forEach( restaurant => {
      Object.keys(grouped[restaurant]).forEach( dish => {
        posts.push(grouped[restaurant][dish][0]);
      });
    })
    // console.log(posts);
    res.status(200).json(posts);

  })
  
}
