const express = require("express");
const router = express.Router();

const Accounts = require('../functions/accounts');

router.get('/', Accounts.test);

router.post('/signup', Accounts.signup);
router.post('/signin', Accounts.signin);
router.post('/reset-password', Accounts.resetPassword);
module.exports = router;
