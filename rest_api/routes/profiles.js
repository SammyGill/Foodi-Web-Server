const express = require("express");
const router = express.Router();

const profiles_controller = require('../controllers/profilesController');
const posts_controller = require('../controllers/postsController');
const auth = require('../middleware/auth');

// GET request for getting list of all usernames in the database (for autocompletion)
router.get('/username-list', profiles_controller.username_list);

// GET request for getting a list of all names (used for autocompletion)
router.get('/name-list', profiles_controller.name_list);

//GET request for getting feed
router.get('/get/feed', auth, posts_controller.get_feed);

// GET request for getting all info related to the profile
// can enter EITHER user id OR username
router.get('/:id_or_username', auth, profiles_controller.get_info);

// PATCH request for editing profile
router.patch('/:user_id/edit', profiles_controller.edit);

// POST request for setting and changing username
router.post('/set-username', auth, profiles_controller.set_username);

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

// POST request to unfollow a user
router.post('/unfollow/:unfollowee_id', auth, profiles_controller.unfollow);


module.exports = router;
