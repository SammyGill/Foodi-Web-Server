const express = require("express");
const router = express.Router();

const dishes_controller = require('../controllers/dishesController');

router.get('/list', dishes_controller.list);

router.get('/suggestions', dishes_controller.suggestions);

router.get('/search', dishes_controller.search);
module.exports = router;