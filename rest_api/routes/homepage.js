const express = require("express");
const router = express.Router();
const viewsDir = "/home/ubuntu/CSE-110-Server/views"
const accounts_controller = require('../controllers/accountsController');


router.get('/homePage', (req, res) => {
  res.sendFile(viewsDir + "/homePage.html");
})


module.exports = router;
