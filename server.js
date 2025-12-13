//1. Importujemy bibliotekę Express
require('dotenv').config();//ładujemy tajne zmienne z pliku .env
const express = require('express');
const mongoose = require('mongoose');//importujemy Mongoose
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { userInfo } = require('os');
const { error } = require('console');

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

        //3. Hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tworzymy nowego użytkownika z zaszyfrowanym hasłem
        const newUser = new User({
            email: email,
            password: hashedPassword//tu wrzucamy krzaki zamiast tekstu
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

//Endpoint logowania
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        //1. Szukamy użytkownika po emailu
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
        }

        //2. Sprawdzamy hasło
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ message: "Nieprawidłowy email lub hasło" })
        }

        //3. Sukces
        res.json({message: "Zalogowano pomyślnie!", userId: user._id, name: user.name });
    } catch {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

//5. Uruchamiamy serwer na porcie 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa! Wejdź na stronę: http://localhost:${PORT}`);
});