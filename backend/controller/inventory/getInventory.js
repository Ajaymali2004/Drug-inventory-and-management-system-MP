const User = require('../../models/User');

const getInventory = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.inventory) {
            user.inventory = [];
            await user.save();
        }

        res.json({ inventory: user.inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getInventory;
