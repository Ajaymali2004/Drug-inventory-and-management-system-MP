const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['supplier', 'hospital', 'admin'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocument: {
        type: String,
        required: function() {
            return this.role === 'hospital' || this.role === 'supplier';
        }
    },
    inventory: [{
        drugId: {
            type: Number,
            enum: [1, 2, 3, 4, 5]
        },
        history: [{
            month: {
                type: String, // Format: 'Month Year' (e.g., 'April 2025')
                required: true
            },
            quantity: {
                type: Number,
                default: 0
            },
            average: {
                type: Number,
                default: 0
            },
            last: {
                type: String,
                default: '' // e.g., 'Added 20 on 30th April'
            }
        }]
    }]
});

// Helper function to get the month and year string
function getCurrentMonthYear() {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
}

// Pre-save hook to handle inventory updates
userSchema.pre('save', function(next) {
    const user = this;

    // Loop through the inventory items and update the history
    user.inventory.forEach(item => {
        const currentMonthYear = getCurrentMonthYear();
        const drugHistory = item.history;

        const monthEntry = drugHistory.find(entry => entry.month === currentMonthYear);
        if (monthEntry) {
            // If the month entry exists, update the quantity, average, and last update
            monthEntry.quantity += item.quantity;
            monthEntry.average = monthEntry.quantity / drugHistory.length;
            monthEntry.last = `Updated ${item.quantity} on ${currentMonthYear}`;
        } else {
            // If the month entry doesn't exist, create a new one
            drugHistory.push({
                month: currentMonthYear,
                quantity: item.quantity,
                average: item.quantity,
                last: `Added ${item.quantity} on ${currentMonthYear}`
            });
        }
    });

    next();
});

// Method to fetch the history of a particular drug for a specific month
userSchema.methods.getDrugHistory = function(drugId, monthYear) {
    const drug = this.inventory.find(item => item.drugId === drugId);
    if (drug) {
        const monthEntry = drug.history.find(entry => entry.month === monthYear);
        return monthEntry || null;
    }
    return null;
};

module.exports = mongoose.model('User', userSchema);
