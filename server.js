//1. Importujemy bibliotekę Express
require('dotenv').config();//ładujemy tajne zmienne z pliku .env
const express = require('express');
const mongoose = require('mongoose');//importujemy Mongoose
const path = require('path');
const User = require('./models/User');

//2. Tworzymy aplikację
const app = express();

//Łączymy się z bazą danych
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Połączono z bazą MongoDB!'))
    .catch(err => console.error('Błąd połączenia z bazą:', err));

//3. Mówimy serwerowi, żeby serwował pliki z naszego folderu
app.use(express.static(path.join(__dirname, '')));
//Pozwala serwerowi rozumieć dane wysyłane w formacie JSON
app.use(express.json());

//4. Definiujemy trasę dla strony głównej
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint Rejestracji
app.post('/api/register', async (req, res) => {
    // 1. Pobieramy dane wysłane przez formularz
    const { email, password } = req.body;

    try {
        // 2. Sprawdzamy, czy taki użytkownik już istnieje
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Taki email jest już zajęty!" });
        }

        // 3. Tworzymy nowego użytkownika 
        const newUser = new User({
            email: email,
            password: password
        });

        // 4. Zapisujemy w bazie
        await newUser.save();

        // 5. Odsyłamy sukces
        res.status(201).json({ message: "Rejestracja udana! Możesz się zalogować." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

//5. Uruchamiamy serwer na porcie 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa! Wejdź na stronę: http://localhost:${PORT}`);
});