const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String, // np. "Wypłata"
        required: true
    },
    amount: {
        type: Number, // np. 5000 lub -200
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);