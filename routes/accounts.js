const express = require("express");
const router = express.Router();
const viewsDir = "/home/ubuntu/CSE-110-Server/views"
const accounts_controller = require('../controllers/accountsController');

const auth = require('../middleware/auth');

router.get('/test-auth', auth, (req, res) => {
  res.status(200).json(req.userData);
});

// POST request for signing up
router.post('/signup', accounts_controller.signup);

// POST request for signing in
router.post('/signin', auth, accounts_controller.signin);

// POSt request for signing out
router.post('/signout', accounts_controller.signout);

// POST request for resetting password
router.post('/reset-password', accounts_controller.reset_password);

// DELETE request for deleting account
router.delete('/delete', accounts_controller.delete_account);

//router.patch('/change-username', accounts_controller.change_usernmae);

module.exports = router;
