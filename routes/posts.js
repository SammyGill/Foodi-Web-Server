const express = require("express");
const router = express.Router();

const posts_controller = require('../controllers/postsController');

// POST request for creating a post
router.post('/create', posts_controller.create_post);

// GET request for getting all info about a post
router.get('/:post_id', posts_controller.get_info);

// GET request for getting all comments related to post
router.get('/:post_id/comments', posts_controller.get_comments);

// DELETE request for deleting a post
router.delete('/:post_id/delete', posts_controller.delete_post);

// POST request to like a post
router.post('/:post_id/like/:like_id', posts_controller.like_post);

// POST request to dislike a post
router.post('/:post_id/dislike/:dislike_id', posts_controller.dislike_post);


module.exports = router;
