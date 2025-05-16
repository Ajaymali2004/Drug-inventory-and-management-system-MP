const express = require('express');
const signup = require('../controllers/auth/signup');
const upload = require('../middlewares/upload');
const login = require('../controller/auth/login');
const approveUser = require('../controller/auth/approveUser');

const router = express.Router();

router.post('/signup', upload.single('verificationDocument'), signup);
router.post('/login', login);
router.post('/approve-user/:userId', approveUser); 
module.exports = router;
