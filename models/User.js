const mongoose = require('mongoose');

// Definiujemy Schemat
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, // Pole wymagane
        unique: true    // Nie może być dwóch takich samych e-maili
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "Użytkownik" // Domyślna nazwa, jak ktoś nie poda
    },
    bio: {
        type: String,
        default: ""//domyślnie puste
    },
    image: {
        type: String,//zdjęcie trzymamy jako długi tekst
        default: ""
    },
    // Tu w przyszłości możemy dodać tablicę zadań, finansów itp.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Tworzymy Model i go eksportujemy
module.exports = mongoose.model('User', userSchema);