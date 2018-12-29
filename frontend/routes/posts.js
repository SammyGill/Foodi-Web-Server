const express = require("express");
const router = express.Router();

const posts_controller = require('../controllers/postsController');

router.get('/create', posts_controller.create);

module.exports = router;

