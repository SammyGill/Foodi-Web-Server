const express = require("express");
const router = express.Router();

const comments_controller = require('../controllers/commentsController');
const auth = require('../middleware/auth');
const auth2 = require('../middleware/auth2');

// POST request for creating a comment
router.post('/create', auth, comments_controller.create_comment);

// GET request for getting all info related to the comment
router.get('/:comment_id', comments_controller.get_info);

// DELETE request for deleting the comment
router.delete('/:comment_id/delete', auth,  comments_controller.delete_comment);

// GET request for getting all the comments related to a post
router.get('/all/:post_id', auth2, comments_controller.get_comments);

module.exports = router;
