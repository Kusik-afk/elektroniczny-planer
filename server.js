//1. Importujemy bibliotekę Express
require('dotenv').config();//ładujemy tajne zmienne z pliku .env
const express = require('express');
const mongoose = require('mongoose');//importujemy Mongoose
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { userInfo } = require('os');
const { error } = require('console');
const Task = require('./models/Task');

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

        // 4. Tworzymy użytkownika z ZASZYFROWANYM hasłem
        const newUser = new User({
            email: email,
            password: hashedPassword // Tu wrzucamy krzaki zamiast tekstu
        });

        await newUser.save();

        // 5. Odsyłamy sukces
        res.status(201).json({ message: "Rejestracja udana! Możesz się zalogować." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// Endpoint Logowania
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Szukamy użytkownika po emailu
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
        }

        // 2. Sprawdzamy hasło 
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
        }

        // 3. Sukces!
        res.json({ message: "Zalogowano pomyślnie!", userId: user._id, name: user.name });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

//API ZADAŃ

// 1. Zapisywanie nowego zadania 
app.post('/api/tasks', async (req, res) => {
    const { userId, day, text } = req.body;

    try {
        const newTask = new Task({
            userId: userId,
            day: day,
            text: text
        });
        
        await newTask.save(); // Zapis do MongoDB
        res.status(201).json(newTask); // Odsyłamy zapisane zadanie do frontendu

    } catch (error) {
        res.status(500).json({ message: "Błąd zapisu" });
    }
});

// 2. Pobieranie zadań konkretnego użytkownika 
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Znajdź w bazie WSZYSTKIE zadania, które mają ten userId
        const tasks = await Task.find({ userId: userId });
        
        res.json(tasks); // Wyślij listę do frontendu

    } catch (error) {
        res.status(500).json({ message: "Błąd pobierania" });
    }
});

//5. Uruchamiamy serwer na porcie 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa! Wejdź na stronę: http://localhost:${PORT}`);
});