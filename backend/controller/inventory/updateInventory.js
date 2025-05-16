// File: controllers/inventory/updateInventory.js
const User = require('../../models/User');

const updateInventory = async (req, res) => {
    try {
        const { userId, drugId, quantity } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const drugIndex = user.inventory.findIndex(item => item.drugId === drugId);

        if (drugIndex === -1) {
            user.inventory.push({
                drugId,
                quantity,
                lastUpdated: new Date()
            });
        } else {
            user.inventory[drugIndex].quantity = quantity;
            user.inventory[drugIndex].lastUpdated = new Date();
        }

        await user.save();
        res.json({ message: 'Inventory updated successfully', inventory: user.inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = updateInventory;