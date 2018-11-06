require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
const checkPostExistsQuery = "SELECT * FROM posts WHERE post_id = ?";

/** Function for creating a post
 */
exports.create_post = (req, res) => {
  const restaurant_id = req.body.restaurant_id;
  const dish_name = req.body.dish_name;
  const author_id = req.body.author_id;
  const caption = req.body.caption;
  const picture = req.body.picture;
  const rating = req.body.rating;
  const date = req.body.date;
  
  const query =
    `INSERT INTO posts
     (dish_name, author_id, caption, picture, rating, date, restaurant_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`;

  mysql.query(query, [dish_name, author_id, caption, picture, rating, date, restaurant_id],
  (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    res.status(201).json( {"Success": "Post created"} );
  })

}

/** Functoin for gettting all info related to the post
 */
exports.get_info = (req, res) => {
  const post_id = req.params.post_id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    else if (result.length == 1) { // found restaurant
      res.status(200).json( result[0] );
    }
    else {
      res.status(404).json( {"Not Found": "Post with this ID does not exist"} );
    }
  });

}

/** Function for getting all comments related to the post
 */
exports.get_comments = (req, res) => {
  const post_id = req.params.post_id;
  res.end("get comments");
}


/** Function to like a post
 */
exports.like_post = (req, res) => {
  const post_id = req.params.post_id;
  const like_id = req.params.like_id;
  res.end("like post " + like_post);
}


/** Function to dislike a post
 */
exports.dislike_post = (req, res) => {
  const post_id = req.params.post_id;
  const dislike_id = req.params.dislike_id;
  res.end("dislike post " + dislike_id);
}

/** Function to delete a post
 */
exports.delete_post = (req, res) => {
  const post_id = req.params.post_id;
  res.end("delete post");
}



exports.add_comment = (req, res) => {

}
