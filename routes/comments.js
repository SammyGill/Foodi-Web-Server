const express = require("express");
const router = express.Router();

const comments_controller = require('../controllers/commentsController');

// GET request for getting all info related to the comment
router.get('/:comment_id', comments_controller.get_info);

// DELETE request for deleting the comment
router.delete('/:comment_id/delete', comments_controller.delete_comment);
module.exports = router;
