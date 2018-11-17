require('dotenv').config({path: '../../env_variables.env'});
const dir = __dirname; 
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});
const checkPostExistsQuery = "SELECT * FROM posts WHERE post_id = ?";
const findLikeDislike = "SELECT * FROM likes WHERE post_id = ? AND user_id = ? AND value = ?";
const deleteEntry = "DELETE FROM likes WHERE post_id = ? AND user_id = ? AND value = ?";
const insertEntry = `INSERT INTO likes (post_id, user_id, value) VALUES (?, ?, ?)`;
const updateLikeCount = "UPDATE posts SET likes=? WHERE post_id=?";
const updateDislikeCount = "UPDATE posts SET dislikes=? WHERE post_id=?";
/** Function for creating a post
 */
exports.create_post = (req, res) => {
  const restaurant_id = req.body.restaurant_id;
  const dish_name = req.body.dish_name;
  const author_id = req.body.author_id;
  const caption = req.body.caption;
  const picture = req.file.filename;
  const rating = req.body.rating;
  const date = req.body.date;
 
  const query =
    `INSERT INTO posts
     (dish_name, author_id, caption, picture, rating, date, restaurant_id)
     VALUES (?, ?, ?, ?, ?, ?, ?); 
     SELECT MAX(post_id) FROM posts;`;

  mysql.query(query, [dish_name, author_id, caption, picture, rating, date, restaurant_id],
  (err, result) => {
    if (err) {
      res.status(500).json( {"Internal Service Error": err} );
      throw err;
    }
    res.status(201).json({
      Created: "Post created", 
      post_id: result[0].insertId,
      picture: req.file.filename
    });
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
  const user_id = req.body.user_id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {
    if (err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    else {
      let count = result[0].likes;
      mysql.query(findLikeDislike, [post_id, user_id, 1], (err, result) => {
        if (result.length == 1){  // user has liked this post before, now undo like
          mysql.query(deleteEntry, [post_id, user_id, 1], (err, result) => {
            if (err) {
              res.status(500).json({"Internal Service Error": err});
              throw err;
            }
            else {
              count -= 1;
              mysql.query(updateLikeCount, [count, post_id], (err) => {
                (err)?
                  res.status(500).json({"Internal Service Error": err}) :
                  res.status(200).json({"Success": "Undo like successful; count for likes changed"});
              });
            }
          });
        }
        else {  // user liking the post for the 1st time
          mysql.query(insertEntry, [post_id, user_id, 1], (err, result) => {
            if (err) {
              res.status(500).json({"Internal Service Error": err});
              throw err;
            }
            else {
              count += 1;
              mysql.query(updateLikeCount, [count, post_id], (err) => {
                (err)?
                  res.status(500).json({"Internal Service Error": err}) :
                  res.status(200).json({"Success": "Create a new like entry; count for likes changed"});
              });
            }
          });
        }
      });
    }
  });
}


/** Function to dislike a post
 */
exports.dislike_post = (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.body.user_id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {
    if (err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    else {
      let count = result[0].dislikes;
      mysql.query(findLikeDislike, [post_id, user_id, -1], (err, result) => {
        if (result.length == 1){  // user has liked this post before, now undo like
          mysql.query(deleteEntry, [post_id, user_id, -1], (err, result) => {
            if (err) {
              res.status(500).json({"Internal Service Error": err});
              throw err;
            }
            else {
              count -= 1;
              mysql.query(updateDislikeCount, [count, post_id], (err) => {
                (err)?
                  res.status(500).json({"Internal Service Error": err}) :
                  res.status(200).json({"Success": "Undo dislike successful; count for dislikes changed"});
              });
            }
          });
        }
        else {  // user liking the post for the 1st time
          mysql.query(insertEntry, [post_id, user_id, -1], (err, result) => {
            if (err) {
              res.status(500).json({"Internal Service Error": err});
              throw err;
            }
            else {
              count += 1;
              mysql.query(updateDislikeCount, [count, post_id], (err) => {
                (err)?
                  res.status(500).json({"Internal Service Error": err}) :
                  res.status(200).json({"Success": "Created a new dislike entry; count for dislikes changed"});
              });
            }
          });
        }
      });
    }
  });
}


/** Function to delete a post
 */
exports.delete_post = (req, res) => {
  const post_id = req.params.post_id;
  res.end("delete post");
}



exports.add_comment = (req, res) => {

}
