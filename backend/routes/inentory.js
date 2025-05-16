const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const getInventory = require('../controllers/inventory/getInventory');
const updateInventory = require('../controllers/inventory/updateInventory');
const getInventoryHistory = require('../controllers/inventory/getInventoryHistory');

const router = express.Router();

router.get('/:userId', authenticateToken, getInventory);
router.post('/update', authenticateToken, updateInventory);
router.get('/history/:userId/:drugId', authenticateToken, getInventoryHistory);

module.exports = router;
