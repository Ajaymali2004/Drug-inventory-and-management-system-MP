const User = require('../../models/User');

const getInventoryHistory = async (req, res) => {
    try {
        const { userId, drugId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const drug = user.inventory.find(item => item.drugId === parseInt(drugId));
        res.json([{
            drugId: parseInt(drugId),
            quantity: drug ? drug.quantity : 0,
            timestamp: new Date()
        }]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getInventoryHistory;