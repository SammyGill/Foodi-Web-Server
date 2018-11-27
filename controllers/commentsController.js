require('dotenv').config({path: '../../env_variables.env'});
const mysql = require('mysql').createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});
const checkCommentExistsQuery = "SELECT * FROM comments WHERE comment_id = ?";

/** Function for creating comment */
exports.create_comment = (req, res) => {
  const user_id = req.userData.id;
  const post_id = req.body.post_id;
  const date = new Date();
  const comment_text = req.body.comment_text;

  const query = 
    `INSERT INTO comments (user_id, post_id, date, comment_text) 
     VALUES (?, ?, ?, ?);
     SELECT MAX(comment_id) FROM comments;`;
  
  mysql.query(query, [user_id, post_id, date, comment_text], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(201).json( {comment_id: result[0].insertId} );
  });
}

/** Function for getting all info related to the comment
 */
exports.get_info = (req, res) => {
  const comment_id = req.params.comment_id;

  const query = `SELECT * FROM comments WHERE comment_id=?`;
  mysql.query(query, [comment_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    (result.length == 0)?
      res.status(404).end() : 
      res.status(200).json( result[0] );
  });
}


/** Function for deleting comment 
 */
exports.delete_comment = (req, res) => {
  const comment_id = req.params.comment_id;
  const user_id = req.userData.id;

  const deleteComment = `DELETE FROM comments WHERE comment_id=? AND user_id=?`;
  mysql.query(deleteComment, [comment_id, user_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      throw err;
    }
    res.status(200).end("Comment deleted");
  });
  
}

/** Function to get all comments for a post
 */
exports.get_comments = (req, res) => {
  const post_id = req.params.post_id;
  const idx = (req.query.idx)? parseInt(req.query.idx) : 0;
  const limit = (req.query.limit)? req.query.limit : 100000;
  const query = "SELECT * FROM comments WHERE post_id = ? AND comment_id > ? ORDER BY date ASC LIMIT "+limit;
  mysql.query(query, [post_id, idx], (err, result) => {
    if(err) {
      res.status(500).json(err).json(err);
      throw err;
    }
    else { 
      res.status(200).json(result);
    }
  });
}
