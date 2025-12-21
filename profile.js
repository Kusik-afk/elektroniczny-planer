// Elementy formularza i wizytówki
const nameInput = document.getElementById("name-input");
const bioInput = document.getElementById("bio-input");
const displayName = document.getElementById("display-name");
const displayBio = document.getElementById("display-bio");
const saveBtn = document.getElementById("save-profile-btn");
const fileUpload = document.getElementById("file-upload");
const profilePic = document.getElementById("profile-pic");

// Elementy statystyk
const statTasks = document.getElementById("stat-tasks");
const statBalance = document.getElementById("stat-balance");
const statShopping = document.getElementById("stat-shopping");

// Pobranie ID użytkownika
const currentUserId = localStorage.getItem("userId");
if (!currentUserId) window.location.href = "login.html";

//1. FUNKCJA POBIERAJĄCA DANE Z SERWERA
async function fetchStats() {
    try {
        const [tasksRes, financeRes, shoppingRes] = await Promise.all([
            fetch(`/api/tasks/${currentUserId}`),       // Pobierz zadania
            fetch(`/api/transactions/${currentUserId}`), // Pobierz finanse
            fetch(`/api/products/${currentUserId}`)      // Pobierz zakupy
        ]);

        const tasks = await tasksRes.json();
        const transactions = await financeRes.json();
        const products = await shoppingRes.json();

        // A. Aktualizacja licznika zadań
        statTasks.innerText = tasks.length;

        // B. Aktualizacja salda 
        const totalBalance = transactions.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
        statBalance.innerText = totalBalance + " PLN";
        
        // Kolorowanie salda
        if (totalBalance >= 0) {
            statBalance.style.color = "var(--success)";
        } else {
            statBalance.style.color = "var(--danger)";
        }

        // C. Aktualizacja licznika zakupów
        statShopping.innerText = products.length;

    } catch (error) {
        console.error("Błąd pobierania statystyk:", error);
        statTasks.innerText = "Błąd";
    }
}

//2. OBSŁUGA DANYCH PROFILOWYCH

function loadProfileSettings() {
    const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
    
    if (userProfile.name) {
        nameInput.value = userProfile.name;
        displayName.innerText = userProfile.name;
    }
    
    if (userProfile.bio) {
        bioInput.value = userProfile.bio;
        displayBio.innerText = userProfile.bio;
    }

    if (userProfile.image) {
        profilePic.src = userProfile.image;
    }
}

// Zapisywanie ustawień 
saveBtn.addEventListener("click", () => {
    const profileData = JSON.parse(localStorage.getItem("userProfile")) || {};
    
    profileData.name = nameInput.value;
    profileData.bio = bioInput.value;

    localStorage.setItem("userProfile", JSON.stringify(profileData));
    
    // Odśwież widok
    displayName.innerText = nameInput.value || "Użytkownik";
    displayBio.innerText = bioInput.value || "Brak opisu";
    
    alert("Profil zaktualizowany!");
});

// Obsługa zdjęcia
fileUpload.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // Limit 2MB
        if (file.size > 2000000) {
            alert("Plik jest za duży! Max 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageBase64 = e.target.result;
            profilePic.src = imageBase64;

            const profileData = JSON.parse(localStorage.getItem("userProfile")) || {};
            profileData.image = imageBase64;
            localStorage.setItem("userProfile", JSON.stringify(profileData));
        }
        reader.readAsDataURL(file);
    }
});

// START
loadProfileSettings(); // Wczytaj zdjęcie i opis z przeglądarki
fetchStats();          // Pobierz liczby z bazy danych