const express = require("express");
const router = express.Router();

const restaurants_controller = require('../controllers/restaurantsController');

router.get('/create', restaurants_controller.create);

router.get('/:restaurant_id', restaurants_controller.view);

module.exports = router;
