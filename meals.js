const mealsContainer = document.querySelector(".meals-container");//nasz tydzień
const saveBtn = document.getElementById("save-meals-btn");//przycisk zapisz cały tydzień
const clearBtn = document.getElementById("clear-meals-btn");//przycisk wyczyść wszystko
const shopInput = document.getElementById("shop-input");//pole do wpisywania zakupów
const addShopBtn = document.getElementById("add-shop-btn");//przycisk dodaj zakupy
const shoppingListContainer = document.getElementById("shopping-list");//lista zakupów

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

//4. Wczytujemy zapisaną listę zakupów
let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

//Funkcja rysująca listę na ekranie
function renderShoppingList() {
    shoppingListContainer.innerHTML = ""; // Czyścimy widok

    shoppingList.forEach((item, index) => {
        const li = document.createElement("li");
        
        // Tworzymy tekst
        const span = document.createElement("span");
        span.innerText = item;
        
        // Tworzymy przycisk usuwania 
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "❌";
        deleteBtn.style.marginLeft = "auto"; // Przesuwa guzik do prawej
        deleteBtn.style.background = "transparent";
        deleteBtn.style.border = "none";
        deleteBtn.style.cursor = "pointer";

        // Obsługa usunięcia
        deleteBtn.addEventListener("click", () => {
            shoppingList.splice(index, 1); // Usuń 1 element pod tym indeksem
            saveAndRender(); // Zapisz i odśwież
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        shoppingListContainer.appendChild(li);
    });
}

//Funkcja pomocnicza: zapisz do bazy i przerysuj
function saveAndRender() {
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
    renderShoppingList();
}

//Obsługa przycisku "Dodaj"
addShopBtn.addEventListener("click", () => {
    const value = shopInput.value;
    if (value === "") return;//jak pusto, to nic nie rób

    shoppingList.push(value);//dodaj do tablicy
    saveAndRender();//zapisz zmiany
    shopInput.value = "";//wyczyść pole wpisywania
});

//Pokaż listę przy wejściu na stronę
renderShoppingList();

//5. Czyszczenie
clearBtn.addEventListener("click", () => {
    if(confirm("Czy na pewno chcesz usunąć cały plan?")) {
        localStorage.removeItem("mealsData");//usuwamy z szuflady
        location.reload();//odświeżamy stronę, żeby wyczyścić pola
    }
})