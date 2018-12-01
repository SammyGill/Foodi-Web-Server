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
const deletePost = "DELETE FROM posts WHERE post_id = ? AND author_id=?";
const newComment = `INSERT INTO comments (comment_text, date, user_id, post_id) 
      VALUES (?, ?, ?, ?); SELECT MAX(comment_id) FROM comments);`;
/** Function for creating a post
 */
exports.create_post = (req, res) => {
  const restaurant_id = req.body.restaurant_id;
  const dish_name = req.body.dish_name;
  const author_id = req.userData.id;
  const caption = req.body.caption;
  const picture = req.file.filename;
  const picture_url = "http://18.224.14.57/api/photos/" + picture;
  const rating = req.body.rating;
  const date = new Date();
 
  const query =
    `INSERT INTO posts
     (dish_name, author_id, caption, picture, picture_url, rating, date, restaurant_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?); 
     SELECT MAX(post_id) FROM posts;`;

  mysql.query(query, [dish_name, author_id, caption, picture, picture_url, rating, date, restaurant_id], 
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

const getPostsQuery = 
        `SELECT p.post_id, p.dish_name, p.author_id, p.caption, p.picture, p.picture_url, 
                p.rating, p.date, p.likes, p.dislikes, p.likes - p.dislikes AS difference
         FROM posts p, restaurants r 
         WHERE p.restaurant_id=r.restaurant_id
         ORDER BY difference DESC`;
/** Function for getting all comments related to the post
 */
exports.get_comments = (req, res) => {
  const post_id = req.params.post_id;
  const idx = (req.query.idx)? parseInt(req.query.idx) : 0;
  const limit = (req.query.limit)? req.query.limit : 100000;
  const query = 
    `SELECT comments.comment_text, comments.date, users.username, users.profile_picture
     FROM comments, users 
     WHERE comments.user_id=users.user_id AND post_id = ? AND comment_id > ? 
     ORDER BY date ASC LIMIT ` + limit;
  mysql.query(query, [post_id, idx], (err, result) => {
    console.log(result);
    if(err) {
      res.status(500).json(err).json(err);
      throw err;
    }
    else { 
      res.status(200).json(result);
    }
  });
}
/** Function to like a post
 */
exports.like_post = (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.userData.id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {// check if the post exists
    if (err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    
    let count = result[0].likes;
    mysql.query(findLikeDislike, [post_id, user_id, -1], (err, result) => {
      if (err) {
        res.status(500).json({"Internal Service Error": err});
        throw err;
      }

      if (result.length == 1)  // user has disliked this post
        res.status(409).json({message: "Cannot like because you've already disliked this post"});
      else {
        mysql.query(findLikeDislike, [post_id, user_id, 1], (err, result) => {
          if (err){
            res.status(500).json({"Internal Service Error": err});
            throw err;
          }

          if (result.length == 1){ // user has liked this post before, now undo like
            const message = "Undo like successful; count for likes changed";
            like_dislike(deleteEntry, post_id, user_id, 1, count-1, message, res);
          }
          else {  // user liked the post for the first time
            const message = "Created a new like entry; count for likes updated";
            like_dislike(insertEntry, post_id, user_id, 1, count+1, message, res);
          }
        });
      }
    });
    
  });
}




/** Function to like a post
 */
exports.dislike_post = (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.userData.id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {// check if the post exists
    if (err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    
    let count = result[0].dislikes;
    mysql.query(findLikeDislike, [post_id, user_id, 1], (err, result) => {
      if (err) {
        res.status(500).json({"Internal Service Error": err});
        throw err;
      }

      if (result.length == 1)  // user has liked this post
        res.status(409).json({message: "Cannot dislike because you've already liked this post"});
      else {
        mysql.query(findLikeDislike, [post_id, user_id, -1], (err, result) => {
          if (err){
            res.status(500).json({"Internal Service Error": err});
            throw err;
          }

          if (result.length == 1){ // user has disliked this post before, now undo dislike
            const message = "Undo dislike successful; count for dislikes changed";
            like_dislike(deleteEntry, post_id, user_id, -1, count-1, message, res);
          }
          else {  // user dislking the post for the first time
            const message = "Created a new dislike entry; count for dislike updated";
            like_dislike(insertEntry, post_id, user_id, -1, count+1, message, res);
          }
        });
      }
    });
    
  });
}

/** Helper function to like or dislike post **/
function like_dislike (query, post_id, user_id, value, count, message, res) {
  mysql.query(query, [post_id, user_id, value], (err, result) => {
    if (err) {
      res.status(500).json({"Internal Service Error": err});
    throw err;
    }
    else {
      const updateQuery = (value == 1)? updateLikeCount : updateDislikeCount; 
      const updated_val = (value == 1)? {likes: count} : {dislikes: count};
      mysql.query(updateQuery, [count, post_id], (err) => {
        (err)?
          res.status(500).json({"Internal Service Error": err}) : 
          res.status(200).json( {OK: message, updated_val: updated_val} );
      });
    }
  });
}
/** Function to delete a post
*/ 
exports.delete_post = (req, res) => {
  const post_id = req.params.post_id;
  const author_id = req.userData.id;
  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {
    if (err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    else {
      if (post_id != author_id)
        res.status(403).json({message: "Cannot delete post that is not yours"});
      else {
        mysql.query(deletePost, [post_id, author_id], (err, result) => {
          if (err) {
            res.status(500).json( {"Internal Service Error": err} );
           throw err;
           }
          else{
            res.status(200).end("Post deleted");
          }
        });
      }
      
    }
  });
}


/** Function to addd comment to a post */
exports.add_comment = (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.body.user_id;
  const comment_text = req.body.comment_text;
  const date = req.body.date;

  mysql.query(checkPostExistsQuery, [post_id], (err, result) => {
    if(err) {
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    else{
      const newComment = `INSERT INTO comments (comment_text, date, user_id, post_id) VALUES (?, ?, ?, ?)`;
      mysql.query(newComment, [comment_text, date, user_id, post_id], (err, result) => {
        if(err) {
          res.status(500).json( {"Internal Service Error": err} );
          throw err;
        }
        res.status(201).json({
          Created: "Comment created",
          comment_id: result[0].insertId
          });
      });
    }
 })
}

/** Function to get posts for feed **/
exports.get_feed = (req, res) => {
  const user_id = req.userData.id;
  const query = 
    `SELECT DISTINCT * FROM posts 
     INNER JOIN users ON users.user_id=posts.author_id 
     INNER JOIN following ON posts.author_id=following.followee_id 
     WHERE following.follower_id = ? 
     ORDER BY post_id DESC`;
  mysql.query(query, [user_id], (err, result) => {
    if(err){
      res.status(500).json({"Internal Service Error": err});
      throw err;
    }
    else {
      //console.log(result.map(e=>e.post_id));
      res.status(200).json(result);
    }
  });

}

