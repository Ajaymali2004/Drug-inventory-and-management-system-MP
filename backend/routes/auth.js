const express = require('express');
const signup = require('../controller/auth/signup');
const login = require('../controller/auth/login');
const approveUser = require('../controller/auth/approveUser');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/signup', upload.single('verificationDocument'), signup);
router.post('/login', login);
router.post('/approve-user/:userId', approveUser); 
module.exports = router;
