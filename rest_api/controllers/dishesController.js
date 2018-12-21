require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});

/** Returns array with all dish names in the database */
exports.list = (req, res) => {
  const query = `SELECT DISTINCT dish_name FROM posts`;
  mysql.query(query, (err, results) => {
  	if (err) {
      res.status(500).json(err);
      throw err;
  	}
    res.status(200).json( results.map( e => e.dish_name ) );
  })
}

/** For autocomplete; returns all dish names beginning with the given query */
exports.suggestions = (req, res) => {
  const dish_name = req.query.dish;
  const query = `SELECT DISTINCT dish_name FROM posts WHERE dish_name LIKE '` + dish_name + `%'`;
  mysql.query(query, [dish_name], (err, results) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).json( results.map( e => e.dish_name ) );
  })
}

/** Function for discovering a dish. Gets all posts with name matching the given
  * query string. Sorts result and returns an array containing the top post
  * (ordered/determined by difference in likes and dislikes) from each restaurant
  */
exports.search = (req, res) => {
  const dish_name = req.query.dish;
  const requestee_uid = req.userData.id;

  const query = 
    `SELECT users.username, users.profile_picture, posts.*,
       restaurants.name AS restaurant_name, likes - dislikes AS difference,
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
     LEFT JOIN restaurants ON restaurants.restaurant_id=posts.restaurant_id
     WHERE dish_name=?
     ORDER BY difference DESC`;

  mysql.query(query, [requestee_uid, requestee_uid, requestee_uid, dish_name], (err, results) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    
    let groupBy = (xs, key) => {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
    let grouped = groupBy(results, 'restaurant_id');

    // get top post of that dish from each restaurant
    let top_posts = [];
    Object.keys(grouped).forEach( e => top_posts.push(grouped[e][0]));

    res.status(200).json( {posts: top_posts} );
  })
}