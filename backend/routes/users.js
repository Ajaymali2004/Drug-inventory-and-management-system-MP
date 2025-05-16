const express = require('express');
const getUsersByRole = require('../controllers/users/getUsersByRole');
const getUser = require('../controllers/users/getUser');
const getPendingUsers = require('../controllers/users/getPendingUsers');
const getAllUsers = require('../controllers/users/getAllUsers');
const getUserInventoryHistory = require('../controllers/users/getUserInventoryHistory');
const authenticateToken = require('../middleware/authToken');

const router = express.Router();

router.get('/:role', authenticateToken, getUsersByRole);
router.get('/history/:userId', authenticateToken, getUserInventoryHistory);
router.get('/all', authenticateToken, getAllUsers);
router.get('/user', authenticateToken, getUser);
router.get('/pending-users', authenticateToken, getPendingUsers);

module.exports = router;
