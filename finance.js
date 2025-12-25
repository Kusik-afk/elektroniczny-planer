const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const listEl = document.getElementById('list');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const addBtn = document.getElementById('add-transaction-btn');

// Pobieramy ID zalogowanego użytkownika
const currentUserId = localStorage.getItem("userId");
if (!currentUserId) window.location.href = "login.html";
//OBSŁUGA WYLOGOWANIA
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Zatrzymaj zwykłe kliknięcie 
        
        // 1. Czyścimy "klucze" z pamięci przeglądarki
        localStorage.removeItem("userId");
        localStorage.removeItem("userProfile");
      
        // 2. Wyświetlamy komunikat
        alert("Wylogowano pomyślnie. Do zobaczenia!");

        // 3. Przenosimy na stronę logowania
        window.location.href = "index.html";
    });
}

// Zmienna na transakcje 
let transactions = [];

// 1. POBIERANIE Z SERWERA
async function getTransactions() {
    try {
        const res = await fetch(`/api/transactions/${currentUserId}`);
        const data = await res.json();

        transactions = data; // Przypisujemy dane z bazy do naszej zmiennej
        updateDOM();
    } catch (err) {
        console.error("Błąd pobierania:", err);
    }
}

// 2. DODAWANIE DO SERWERA
async function addTransaction() {
    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Wypełnij pola');
        return;
    }

    const newTrans = {
        userId: currentUserId,
        text: textInput.value,
        amount: +amountInput.value
    };

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTrans)
        });

        const savedTrans = await res.json(); // Otrzymujemy wpis z bazy 
        
        transactions.push(savedTrans);
        updateDOM();
        
        textInput.value = '';
        amountInput.value = '';
    } catch (err) {
        console.error("Błąd zapisu:", err);
    }
}

// 3. USUWANIE Z SERWERA
async function removeTransaction(id) {
    if(!confirm("Czy na pewno usunąć?")) return;

    try {
        await fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        });

        // Usuwamy też z widoku 
        transactions = transactions.filter(t => t._id !== id);
        updateDOM();
    } catch (err) {
        console.error("Błąd usuwania:", err);
    }
}

// FUNKCJE POMOCNICZE

function updateDOM() {
    listEl.innerHTML = '';
    transactions.forEach(renderTransaction);
    updateValues();
}

function renderTransaction(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const itemClass = transaction.amount < 0 ? 'minus' : 'plus';
    const item = document.createElement('li');
    item.classList.add(itemClass);

    item.innerHTML = `
        ${transaction.text} 
        <span>${sign}${Math.abs(transaction.amount)} PLN</span>
        <button class="delete-btn" onclick="removeTransaction('${transaction._id}')">x</button>
    `;
    listEl.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balanceEl.innerText = `${total} PLN`;
    moneyPlusEl.innerText = `+${income} PLN`;
    moneyMinusEl.innerText = `-${expense} PLN`;
}

// Przypisanie funkcji usuwania do okna
window.removeTransaction = removeTransaction;

addBtn.addEventListener('click', addTransaction);
getTransactions();