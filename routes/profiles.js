const express = require("express");
const router = express.Router();

const Profiles = require('../functions/profiles');

router.get('/profiles/getFollowers', Profiles.getFollowers);
router.get('/profiles/getFollowing', Profiles.getFollowing);

module.exports = router;
