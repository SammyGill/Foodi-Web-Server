const express = require("express");
const router = express.Router();

const posts_controller = require('../controllers/postsController');

router.get('/create', posts_controller.create);

router.get('/:post_id', posts_controller.view);

module.exports = router;

