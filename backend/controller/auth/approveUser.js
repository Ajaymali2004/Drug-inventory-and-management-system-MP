const User = require('../../models/User');

const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        req.io.emit('userApproved', {
            userId: user._id,
            message: `Your account has been approved`
        });

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = approveUser;
