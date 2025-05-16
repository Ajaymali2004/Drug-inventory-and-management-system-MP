const User = require('../../models/User');
  
  const getPendingUsers = async (req, res) => {
      try {
          if (req.user.role !== 'admin') {
              return res.status(403).json({ message: 'Not authorized' });
          }
  
          const pendingUsers = await User.find({
              isVerified: false,
              role: { $in: ['hospital', 'supplier'] }
          });
  
          res.json(pendingUsers);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  };
  
  module.exports = getPendingUsers;