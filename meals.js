const mealsContainer = document.querySelector(".meals-container");//nasz tydzień
const saveBtn = document.getElementById("save-meals-btn");//przycisk zapisz cały tydzień
const clearBtn = document.getElementById("clear-meals-btn");//przycisk wyczyść wszystko
const shopInput = document.getElementById("shop-input");//pole do wpisywania zakupów
const addShopBtn = document.getElementById("add-shop-btn");//przycisk dodaj zakupy
const shoppingListContainer = document.getElementById("shopping-list");//lista zakupów

// Pobieramy ID użytkownika
const currentUserId = localStorage.getItem("userId");
if (!currentUserId && window.location.pathname.includes("meals.html")) {
     window.location.href = "login.html";
}

const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

//1. Wczytanie danych
let mealsData = JSON.parse(localStorage.getItem("mealsData")) || {};

//2. Generowanie kart
daysOfWeek.forEach((dayName) => {
    //Tworzymy kartę
    const card = document.createElement("div");
    card.classList.add("meal-card");

    //Pobieramy zapisane dane dla tego dnia
    const breakfast = mealsData[dayName]?.breakfast || "";
    const lunch = mealsData[dayName]?.lunch || "";
    const dinner = mealsData[dayName]?.dinner || "";

    //Wypełniamy kartę HTML-em
    card.innerHTML = `
        <h3>${dayName}</h3>
        <input type="text" class="meal-input" data-day="${dayName}" data-type="breakfast" placeholder="Śniadanie" value="${breakfast}">
        <input type="text" class="meal-input" data-day="${dayName}" data-type="lunch" placeholder="Obiad" value="${lunch}">
        <input type="text" class="meal-input" data-day="${dayName}" data-type="dinner" placeholder="Kolacja" value="${dinner}">
    `;
    
    //Wrzucamy gotową kartę na stronę
    mealsContainer.appendChild(card);
});

//3. Zapisywanie
saveBtn.addEventListener("click", () => {
    //Pobieramy wszytkie inputy z całej strony
    const allInputs = document.querySelectorAll(".meal-input");

    //Tymczasowy obiekt do zbierania nowych danych
    const newMealsData = {};

    //Lecimy przez każdy input i zapisujemy go
    allInputs.forEach(input => {
        const day = input.dataset.day;
        const type = input.dataset.type;
        const value = input.value;

        //Jeśli w naszym obiekcie nie ma jeszcze tego dnia, tworzymy go
        if (!newMealsData[day]) {
            newMealsData[day] = {};
        }

        //Zapisujemy wartość
        newMealsData[day][type] = value;
    });

    //Zapisujemy do LocalStorage pod kluczem "mealsData"
    localStorage.setItem("mealsData", JSON.stringify(newMealsData));

    alert("Jadłospis zapisany!");
});

//4. Wczytujemy listę zakupów
let shoppingList = [];

//POBIERANIE Z SERWERA
async function fetchShoppingList() {
    try {
        const res = await fetch(`/api/products/${currentUserId}`);
        const data = await res.json();
        shoppingList = data;
        renderShoppingList();
    } catch (err) {
        console.error("Błąd pobierania listy:", err);
    }
}

//RYSOWANIE LISTY
function renderShoppingList() {
    shoppingListContainer.innerHTML = ""; // Czyścimy

    shoppingList.forEach((item) => {
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.innerText = item.name;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "❌";
        deleteBtn.style.marginLeft = "auto";
        deleteBtn.style.background = "transparent";
        deleteBtn.style.border = "none";
        deleteBtn.style.cursor = "pointer";

        // Obsługa usuwania (po ID z bazy!)
        deleteBtn.addEventListener("click", async () => {
            await removeProduct(item._id);
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        shoppingListContainer.appendChild(li);
    });
}

//DODAWANIE DO SERWERA
addShopBtn.addEventListener("click", async () => {
    const value = shopInput.value;
    if (value === "") return;

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, name: value })
        });
        
        const newProduct = await res.json();
        shoppingList.push(newProduct);
        renderShoppingList();
        shopInput.value = "";
    } catch (err) {
        console.error("Błąd dodawania:", err);
    }
});

//USUWANIE Z SERWERA
async function removeProduct(id) {
    try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        
        // Aktualizacja widoku bez odświeżania strony
        shoppingList = shoppingList.filter(item => item._id !== id);
        renderShoppingList();
    } catch (err) {
        console.error("Błąd usuwania:", err);
    }
}

// Startujemy pobieranie tylko jeśli jesteśmy na stronie meals.html
if (document.getElementById("shopping-list")) {
    fetchShoppingList();
}

//5. Czyszczenie
clearBtn.addEventListener("click", () => {
    if(confirm("Czy na pewno chcesz usunąć cały plan?")) {
        localStorage.removeItem("mealsData");//usuwamy z szuflady
        location.reload();//odświeżamy stronę, żeby wyczyścić pola
    }
})