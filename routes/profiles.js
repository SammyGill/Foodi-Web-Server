const express = require("express");
const router = express.Router();

const profiles_controller = require('../controllers/profilesController');
const auth = require('../middleware/auth');

// GET request for getting all info related to the profile
router.get('/:user_id', profiles_controller.get_info);

// PATCH request for editing profile
router.patch('/:user_id/edit', profiles_controller.edit);

// GET request for viewing all of the user's posts
router.get('/:user_id/posts', profiles_controller.get_posts);

// GET request for getting a list of activities (history)
router.get('/:user_id/activity', profiles_controller.get_activities);

// GET request for getting all of the user's followers
router.get('/:user_id/get-followers', profiles_controller.get_followers);

// GET request for getting a list of people the user follows
router.get('/:user_id/get-following', profiles_controller.get_following);

// POST request to follow a user
router.post('/follow/:followee_id', auth, profiles_controller.follow);

// DELETE request to unfollow a user
router.delete('/unfollow/:unfollowee_id', auth, profiles_controller.unfollow);


module.exports = router;
