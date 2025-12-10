//1. Importujemy bibliotekę Express
require('dotenv').config();//ładujemy tajne zmienne z pliku .env
const express = require('express');
const mongoose = require('mongoose');//importujemy Mongoose
const path = require('path');

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

//5. Uruchamiamy serwer na porcie 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa! Wejdź na stronę: http://localhost:${PORT}`);
});