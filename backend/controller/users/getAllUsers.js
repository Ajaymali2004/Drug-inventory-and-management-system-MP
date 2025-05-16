const User = require('../../models/User');

const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.find({
            isVerified: true,
            role: { $ne: 'admin' }
        }).select('_id name role email');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getAllUsers;