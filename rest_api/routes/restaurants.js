const express = require("express");
const router = express.Router();

const restaurants_controller = require('../controllers/restaurantsController');

// POST request for creating a restaurant
router.post('/create', restaurants_controller.create_restaurant);

// GET request when trying to discover restaurants
router.get('/discover', restaurants_controller.discover);

// GET request for getting all restaurants in the database
router.get('/', restaurants_controller.get_all_restaurants);

// GET request for getting all info related to the restaurant
router.get('/:restaurant_id', restaurants_controller.get_info);

// GET request for getting a list of all dishes in a restaurant
router.get('/:restaurant_id/dish-list', restaurants_controller.get_dish_list);

module.exports = router;
