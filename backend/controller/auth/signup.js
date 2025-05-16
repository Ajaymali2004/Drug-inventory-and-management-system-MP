const bcrypt = require('bcrypt');
const User = require('../../models/User'); // adjust path

const signup = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        if (role === 'admin') {
            return res.status(400).json({ message: 'Cannot register as admin' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if ((role === 'hospital' || role === 'supplier') && !req.file) {
            return res.status(400).json({ message: 'Verification document is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            role,
            name,
            verificationDocument: req.file ? req.file.path : null
        });

        await user.save();

        req.io.emit('newRegistration', {
            message: `New ${role} registration: ${name}`,
            userId: user._id
        });

        res.status(201).json({ message: 'Registration pending admin approval' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = signup;
