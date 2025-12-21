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
const Transaction = require('./models/Transaction');
const Product = require('./models/Product');

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

// API FINANSÓW

// 1. Dodaj transakcję
app.post('/api/transactions', async (req, res) => {
    try {
        const { userId, text, amount } = req.body;
        const newTransaction = new Transaction({ userId, text, amount });
        
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(500).json({ error: 'Błąd zapisu' });
    }
});

// 2. Pobierz historię
app.get('/api/transactions/:userId', async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.params.userId });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Błąd pobierania' });
    }
});

// 3. USUWANIE 
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ error: 'Nie znaleziono transakcji' });
        }

        // Metoda Mongoose do usuwania
        await Transaction.deleteOne({ _id: req.params.id });

        res.json({ success: true, message: 'Usunięto' });
    } catch (err) {
        res.status(500).json({ error: 'Błąd usuwania' });
    }
});

//API LISTY ZAKUPÓW

// 1. Dodaj produkt
app.post('/api/products', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const newProduct = new Product({ userId, name });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Błąd zapisu' });
    }
});

// 2. Pobierz listę
app.get('/api/products/:userId', async (req, res) => {
    try {
        const list = await Product.find({ userId: req.params.userId });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Błąd pobierania' });
    }
});

// 3. Usuń produkt
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Błąd usuwania' });
    }
});

//5. Uruchamiamy serwer na porcie 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});