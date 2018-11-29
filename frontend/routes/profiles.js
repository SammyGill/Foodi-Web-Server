const express = require("express");
const router = express.Router();

const profiles_controller = require('../controllers/profilesController');


router.get('/:username', profiles_controller.view);

router.get('/:username/posts', profiles_controller.view_posts);

module.exports = router;
