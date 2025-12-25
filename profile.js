// Elementy formularza i wizytówki
const nameInput = document.getElementById("name-input");//pole do edycji imienia
const bioInput = document.getElementById("bio-input");//pole do edycji opisu
const displayName = document.getElementById("display-name");//imię wyświetlane pod zdjęciem
const displayBio = document.getElementById("display-bio");//opis wyświetlany po imieniem
const saveBtn = document.getElementById("save-profile-btn");//przycisk zapisz zmiany edycji danych profilowych
const fileUpload = document.getElementById("file-upload");//iconka kamery do zmieniania zdjęcia
const profilePic = document.getElementById("profile-pic");//zdjęcie wyświetlane

// Elementy statystyk
const statTasks = document.getElementById("stat-tasks");//liczba zadań 
const statBalance = document.getElementById("stat-balance");//stan salda
const statShopping = document.getElementById("stat-shopping");//liczba produktów
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

// Pobieramy ID zalogowanego użytkownika
const currentUserId = localStorage.getItem("userId");
if (!currentUserId) window.location.href = "login.html";

// Zmienna tymczasowa na zdjęcie 
let currentImageBase64 = "";

//1. POBIERANIE WSZYSTKICH DANYCH
async function fetchAllData() {
    try {
        // Wysyłamy 4 zapytania naraz: Użytkownik, Zadania, Finanse, Zakupy
        const [userRes, tasksRes, financeRes, shoppingRes] = await Promise.all([
            fetch(`/api/user/${currentUserId}`),
            fetch(`/api/tasks/${currentUserId}`),
            fetch(`/api/transactions/${currentUserId}`),
            fetch(`/api/products/${currentUserId}`)
        ]);

        //Obsługa danych PROFILU
        const userData = await userRes.json();
        if (userData.name) {
            nameInput.value = userData.name;
            displayName.innerText = userData.name;
        }
        if (userData.bio) {
            bioInput.value = userData.bio;
            displayBio.innerText = userData.bio;
        }
        if (userData.image) {
            profilePic.src = userData.image;
            currentImageBase64 = userData.image; // Zapamiętujemy obecne zdjęcie
        }

        //Obsługa STATYSTYK
        const tasks = await tasksRes.json();
        statTasks.innerText = tasks.length;

        const transactions = await financeRes.json();
        const totalBalance = transactions.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
        statBalance.innerText = totalBalance + " PLN";
        statBalance.style.color = totalBalance >= 0 ? "var(--success)" : "var(--danger)";

        const products = await shoppingRes.json();
        statShopping.innerText = products.length;

    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
}

//2. ZAPISYWANIE PROFILU DO BAZY
saveBtn.addEventListener("click", async () => {
    const newName = nameInput.value;
    const newBio = bioInput.value;

    try {
        const response = await fetch(`/api/user/${currentUserId}`, {
            method: 'PUT', // Metoda aktualizacji
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newName,
                bio: newBio,
                image: currentImageBase64 // Wysyłamy też zdjęcie 
            })
        });

        if (response.ok) {
            // Aktualizujemy widok bez odświeżania strony
            displayName.innerText = newName;
            displayBio.innerText = newBio;
            
            // Możemy zapisać imię w LocalStorage dla powitania na stronie głównej
            const profileData = { name: newName };
            localStorage.setItem("userProfile", JSON.stringify(profileData));

            alert("Profil zapisany w bazie danych!");
        } else {
            alert("Błąd zapisu.");
        }

    } catch (error) {
        console.error(error);
        alert("Błąd połączenia.");
    }
});

//3. OBSŁUGA ZDJĘCIA
fileUpload.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        
        //Limit wielkości dokumentu w MongoDB
        if (file.size > 500000) { // 500KB limit
            alert("Plik jest za duży! Wybierz mniejsze zdjęcie (max 500KB).");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageBase64 = e.target.result; // Zamiana pliku na tekst
            profilePic.src = currentImageBase64;  // Podgląd na żywo
        }
        reader.readAsDataURL(file);
    }
});

// Start
fetchAllData();