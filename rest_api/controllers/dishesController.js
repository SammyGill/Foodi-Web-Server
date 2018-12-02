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
    console.log(results);
    res.status(200).json( results.map( e => e.dish_name ) );
  })
}

/** Function for discovering a dish. Gets all posts with name matching the given
  * query string. Sorts result and returns an array containing the top post
  * (ordered/determined by difference in likes and dislikes) from each restaurant
  */
exports.search = (req, res) => {
  const dish_name = req.query.dish;
  const query = 
    `SELECT *, likes - dislikes AS difference 
     FROM posts 
     WHERE dish_name=?
     ORDER BY difference DESC`;

  mysql.query(query, [dish_name], (err, results) => {
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