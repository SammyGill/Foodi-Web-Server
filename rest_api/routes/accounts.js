const express = require("express");
const router = express.Router();
const viewsDir = "/home/ubuntu/CSE-110-Server/views"
const accounts_controller = require('../controllers/accountsController');

const auth = require('../middleware/auth');

router.get('/test-auth', auth, (req, res) => {
  res.status(200).json(req.userData);
});


// POST request for signing in
router.post('/signin', auth, accounts_controller.signin);

// DELETE request for deleting account
router.delete('/delete', auth, accounts_controller.delete_account);


module.exports = router;
