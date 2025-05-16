require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const User = require('./models/User');
const Message = require('./models/Message');

app.use(cors());
app.use(express.json());
app.use((req,res,next) => {
    req.io = io;
    next();
});
app.use('/uploads', express.static('uploads'));

// Authentication Routes
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authToken');
app.use("/auth",authRoutes);



// Get inventory for a user
app.get('/api/inventory/:userId', authenticateToken, );

// Update inventory
app.post('/api/inventory/update', authenticateToken, async (req, res) => {
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
});

// Get users by role
app.get('/api/users/:role', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({ 
            role: req.params.role, 
            isVerified: true 
        }).select('_id name role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user data
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending users (for admin)
app.get('/api/pending-users', authenticateToken, async (req, res) => {
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
});

// Get users by role (for chat)
app.get('/api/users/:role', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({
            role: req.params.role,
            isVerified: true
        }).select('_id name role');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all verified users (for admin)
app.get('/api/users/all', authenticateToken, async (req, res) => {
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
});

// Get inventory history for a user
app.get('/api/inventory/history/:userId/:drugId', authenticateToken, async (req, res) => {
    try {
        const { userId, drugId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // For now, return the current inventory data
        // In a real application, you would store and return historical data
        const drug = user.inventory.find(item => item.drugId === parseInt(drugId));
        res.json([{
            drugId: parseInt(drugId),
            quantity: drug ? drug.quantity : 0,
            timestamp: new Date()
        }]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get('/api/users/history/:userId', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return the inventory
      res.json(user.inventory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });  

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('message', async (messageData) => {
        try {
            const message = new Message(messageData);
            await message.save();
            io.emit('message', messageData);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug-inventory')
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Database connection error:', err));