const nameInput = document.getElementById("name-input");//pole do wpisywania imienia
const bioInput = document.getElementById("bio-input");//pole O sobie
const displayName = document.getElementById("display-name");//h2 Użytkownik
const displayBio = document.getElementById("display-bio");//opis 
const saveBtn = document.getElementById("save-profile-btn");//przycisk Zapisz zmiany
const fileUpload = document.getElementById("file-upload");//input zdjęcie
const profilePic = document.getElementById("profile-pic");//src zdjęcia

//Elementy statystyk
const statTasks = document.getElementById("stat-tasks");//ilość zadań w kalendarzu
const statBalance = document.getElementById("stat-balance");//aktualne saldo
const statShopping = document.getElementById("stat-shopping");//ilość rzeczy do kupienia

//1. Ładowanie danych przy starcie
function loadProfile() {
    //Wczytaj dane osobowe
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
        profilePic.src = userProfile.image;//wstawiamy zapisany obrazek
    }

    //Wczytujemy statytyki z innych podstron LocalStorage
    calculateStats();
}

//2. Oblicznie statystyk
function calculateStats() {
    //Kalendarz
    const tasksData = JSON.parse(localStorage.getItem("plannerData")) || {};
    let totalTasks = 0;
    //Object.values wyciąga same tablice zdań, a flat() łączy je w jedną dużą tablicę
    if (Object.keys(tasksData).length > 0) {
        totalTasks = Object.values(tasksData).flat().length;
    }
    statTasks.innerText = totalTasks;

    //Finanse
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    //Liczymy sumę
    const totalBalance = transactions.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
    statBalance.innerText = totalBalance + "PLN";

    //Zakupy
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    statShopping.innerText = shoppingList.length;
}

//3. Zapisywanie danych tekstowych
saveBtn.addEventListener("click", () => {
    const profileData = JSON.parse(localStorage.getItem("userProfile")) || {};

    profileData.name = nameInput.value;
    profileData.bio = bioInput.value;

    localStorage.setItem("userProfile", JSON.stringify(profileData));

    //Odświeżamy widok
    displayName.innerText = nameInput.value;
    displayBio.innerText = bioInput.value;
    alert("Profil zaktualizowany!");
});

// 4. OBSŁUGA ZDJĘCIA 
fileUpload.addEventListener("change", function() {
    // Sprawdzamy, czy użytkownik wybrał plik
    if (this.files && this.files[0]) {
        const file = this.files[0];

        // Ograniczenie
        if (file.size > 2000000) { // 2MB
            alert("Plik jest za duży! Wybierz mniejsze zdjęcie.");
            return;
        }

        const reader = new FileReader();

        // Kiedy czytnik skończy przetwarzać plik...
        reader.onload = function(e) {
            const imageBase64 = e.target.result; // To jest nasz obrazek jako tekst
            
            // Wyświetl na stronie
            profilePic.src = imageBase64;

            // Zapisz w pamięci
            const profileData = JSON.parse(localStorage.getItem("userProfile")) || {};
            profileData.image = imageBase64;
            localStorage.setItem("userProfile", JSON.stringify(profileData));
        }

        // Komenda
        reader.readAsDataURL(file);
    }
});

// Start
loadProfile();