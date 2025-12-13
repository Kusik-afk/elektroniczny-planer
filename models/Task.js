const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {
        type: String, // Tu wpiszemy ID użytkownika 
        required: true
    },
    day: {
        type: Number, // Numer dnia miesiąca 
        required: true
    },
    text: {
        type: String, // Treść
        required: true
    }
});

module.exports = mongoose.model('Task', taskSchema);