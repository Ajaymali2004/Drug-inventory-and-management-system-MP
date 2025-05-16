const User = require('../../models/User');

const getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({
            role: req.params.role,
            isVerified: true
        }).select('_id name role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getUsersByRole;