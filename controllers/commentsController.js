/** Function for getting all info related to the comment
 */
exports.get_info = (req, res) => {
  const comment_id = req.params.comment_id;
  res.end("info for comment " + comment_id);
}

/** Function for deleting comment 
 */
exports.delete_comment = (req, res) => {
  const comment_id = req.params.comment_id;
  res.end("delete commetn");
}
