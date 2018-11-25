const express = require("express");
const router = express.Router();

const comments_controller = require('../controllers/commentsController');
const auth = require('../middleware/auth');
// POST request for creating a comment
router.post('/create', auth, comments_controller.create_comment);

// GET request for getting all info related to the comment
router.get('/:comment_id', comments_controller.get_info);

// DELETE request for deleting the comment
router.delete('/:comment_id/delete', auth,  comments_controller.delete_comment);
module.exports = router;
