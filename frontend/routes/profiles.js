const express = require("express");
const router = express.Router();

const profiles_controller = require('../controllers/profilesController');


router.get('/:username', profiles_controller.view);

module.exports = router;
