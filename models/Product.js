const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String, // np. "Mleko"
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);