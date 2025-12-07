const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const listEl = document.getElementById('list');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const addBtn = document.getElementById('add-transaction-btn');

// 1. Wczytujemy transakcje z LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// 2. Funkcja dodająca transakcję
function addTransaction() {
    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Proszę wypełnić opis i kwotę');
        return;
    }

    const transaction = {
        id: generateID(),
        text: textInput.value,
        amount: +amountInput.value // Ten "plus" przed zmienną zamienia tekst na liczbę
    };

    transactions.push(transaction);

    updateValues(); // Przeliczamy saldo
    renderTransaction(transaction); // Dodajemy do listy
    updateLocalStorage(); // Zapisujemy

    textInput.value = '';
    amountInput.value = '';
}

// 3. Generowanie losowego ID 
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// 4. Wyświetlanie transakcji na liście
function renderTransaction(transaction) {
    // Sprawdzamy czy kwota jest wydatkiem czy przychodem
    const sign = transaction.amount < 0 ? '-' : '+';
    const itemClass = transaction.amount < 0 ? 'minus' : 'plus';

    const item = document.createElement('li');
    
    // Dodajemy klasę CSS
    item.classList.add(itemClass);

    // Math.abs() usuwa minusa z liczby
    item.innerHTML = `
        ${transaction.text} 
        <span>${sign}${Math.abs(transaction.amount)} PLN</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    listEl.appendChild(item);
}

// 5. Aktualizacja salda, przychodów i wydatków
function updateValues() {
    // Wyciągamy same kwoty z obiektów transakcji
    const amounts = transactions.map(transaction => transaction.amount);

    // reduce() to funkcja, która sumuje całą tablicę liczb
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    // Filtrujemy tylko dodatnie, sumujemy
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    // Filtrujemy tylko ujemne, sumujemy
    const expense = (
        amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balanceEl.innerText = `${total} PLN`;
    moneyPlusEl.innerText = `+${income} PLN`;
    moneyMinusEl.innerText = `-${expense} PLN`;
}

// 6. Usuwanie transakcji po ID
function removeTransaction(id) {
    // Zostawiamy tylko te transakcje, które NIE mają tego ID
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init(); // Przeładowujemy widok
}

// 7. Zapis do bazy
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 8. Start aplikacji
function init() {
    listEl.innerHTML = '';
    transactions.forEach(renderTransaction);
    updateValues();
}

init();
addBtn.addEventListener('click', addTransaction);

window.removeTransaction = removeTransaction;