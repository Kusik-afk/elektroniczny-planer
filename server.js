//1. Importujemy bibliotekę Express
const express = require('express');
const path = require('path');

//2. Tworzymy aplikację
const app = express();

//3. Mówimy serwerowi, żeby serwował pliki z naszego folderu
app.use(express.static(path.join(__dirname, '')));

//4. Definiujemy trasę dla strony głównej
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//5. Uruchamiamy serwer na porcie 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa! Wejdź na stronę: http://localhost:${PORT}`);
});