/** Function for creating a post
 */
exports.create_post = (req, res) => {

}


/** Function for getting all info related to the post
 */
exports.get_info = (req, res) => {
  const post_id = req.params.post_id;
  res.end("get info");
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
