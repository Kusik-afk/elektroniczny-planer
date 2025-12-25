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

// OBSŁUGA WYLOGOWANIA
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("userId");
        localStorage.removeItem("userProfile");
        alert("Wylogowano pomyślnie. Do zobaczenia!");
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

        transactions = data;
        updateDOM();
    } catch (err) {
        console.error("Błąd pobierania:", err);
        listEl.innerHTML = '<p style="text-align:center; color:red;">Błąd pobierania danych</p>';
    }
}

// 2. DODAWANIE DO SERWERA
async function addTransaction() {
    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Wypełnij oba pola (nazwa i kwota)');
        return;
    }

    //BLOKOWANIE PRZYCISKU
    addBtn.disabled = true;
    const originalText = addBtn.innerText;
    addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dodawanie...';

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

        if (!res.ok) throw new Error("Błąd serwera");

        const savedTrans = await res.json();
        
        transactions.push(savedTrans);
        updateDOM();
        
        textInput.value = '';
        amountInput.value = '';

    } catch (err) {
        console.error("Błąd zapisu:", err);
        alert("Wystąpił błąd przy dodawaniu.");
    } finally {
        // Zawsze przywracamy przycisk, niezależnie czy sukces czy błąd
        addBtn.disabled = false;
        addBtn.innerText = originalText;
    }
}

// 3. USUWANIE Z SERWERA
async function removeTransaction(id) {
    if(!confirm("Czy na pewno usunąć tę transakcję?")) return;

    try {
        await fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        });

        transactions = transactions.filter(t => t._id !== id);
        updateDOM();
    } catch (err) {
        console.error("Błąd usuwania:", err);
        alert("Nie udało się usunąć.");
    }
}

// FUNKCJE POMOCNICZE

function updateDOM() {
    listEl.innerHTML = '';

    //PUSTY STAN
    if (transactions.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; color: #aaa; padding: 30px;">
                <i class="fa-solid fa-piggy-bank" style="font-size: 40px; margin-bottom: 10px; color: var(--accent-color);"></i>
                <p>Brak transakcji.<br>Dodaj swój pierwszy wydatek lub przychód.</p>
            </div>
        `;
        updateValues(); 
        return;
    }

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
        <span>${sign}${Math.abs(transaction.amount).toFixed(2)} PLN</span>
        <button class="delete-btn" onclick="removeTransaction('${transaction._id}')">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    listEl.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    
    // Obliczenia
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balanceEl.innerText = `${total} PLN`;
    moneyPlusEl.innerText = `+${income} PLN`;
    moneyMinusEl.innerText = `-${expense} PLN`;

    //KOLOR SALDA
    if (total < 0) {
        balanceEl.style.color = "var(--danger)"; // Czerwony jak debet
    } else {
        balanceEl.style.color = "var(--text-dark)"; // Normalny kolor jak jest ok
    }
}

// Przypisanie funkcji usuwania do okna
window.removeTransaction = removeTransaction;

// Start
addBtn.addEventListener('click', addTransaction);
getTransactions();