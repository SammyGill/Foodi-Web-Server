const express = require("express");
const router = express.Router();

const dishes_controller = require('../controllers/dishesController');
const auth2 = require('../middleware/auth2')

router.get('/list', dishes_controller.list);

router.get('/suggestions', auth2, dishes_controller.suggestions);

router.get('/search', auth2, dishes_controller.search);
module.exports = router;