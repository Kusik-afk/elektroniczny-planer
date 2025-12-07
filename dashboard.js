const calendarContainer = document.getElementById("calendar");//nasz grid
const modalOverlay = document.getElementById("modal-overlay");//nasze całe przyciemnione okienko
const closeBtn = document.querySelector(".close-btn");//span krzyżyka
const saveBtn = document.getElementById("save-btn");//button zapisz
const taskInput = document.getElementById("task-input");//textarea wpisu
const dateDisplay = document.getElementById("selected-date");//Dzień nr..

const totalDays = 31;
let selectedDayNumber = null; // Tu będziemy trzymać numer klikniętego dnia

// 1. WCZYTANIE DANYCH
let tasksData = JSON.parse(localStorage.getItem("plannerData")) || {};

// Funkcja pomocnicza: Rysowanie zadań w konkretnym dniu
function renderTasks(dayNumber, dayElement) {
    // Czyścimy stare wpisy w tym dniu, żeby się nie dublowały
    const existingTasks = dayElement.querySelectorAll('.task');
    existingTasks.forEach(task => task.remove());

    // Sprawdzamy, czy w danych mamy jakieś zadania dla tego dnia
    if (tasksData[dayNumber]) {
        // Jeśli są, to lecimy pętlą i je dodajemy
        tasksData[dayNumber].forEach(taskText => {
            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task");
            taskDiv.innerText = taskText;
            dayElement.appendChild(taskDiv);
        });
    }
}

// 2. GENEROWANIE KALENDARZA
for (let day = 1; day <= totalDays; day++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day-box");
    dayBox.innerHTML = `<div class="day-number">${day}</div>`;

    // Od razu przy starcie rysujemy zapisane zadania dla tego dnia
    renderTasks(day, dayBox);

    // Obsługa kliknięcia
    dayBox.addEventListener("click", function() {
        selectedDayNumber = day; // Zapamiętujemy numer dnia
        dateDisplay.innerText = "Dzień: " + day;
        modalOverlay.style.display = "flex";
    });

    calendarContainer.appendChild(dayBox);
}

// 3. ZAPISYWANIE NOWEGO ZADANIA
saveBtn.addEventListener("click", function() {
    const taskText = taskInput.value;

    if (taskText === "") return;

    // A. Aktualizacja danych w pamięci RAM
    if (!tasksData[selectedDayNumber]) {
        tasksData[selectedDayNumber] = []; // Jeśli nie ma tablicy dla tego dnia, stwórz ją
    }
    tasksData[selectedDayNumber].push(taskText); // Dodaj zadanie do listy

    // B. Robimy trwały zapis
    localStorage.setItem("plannerData", JSON.stringify(tasksData));

    // C. Aktualizacja widoku 
    const dayBoxToUpdate = calendarContainer.children[selectedDayNumber - 1];
    renderTasks(selectedDayNumber, dayBoxToUpdate);

    // Sprzątanie
    modalOverlay.style.display = "none";
    taskInput.value = "";
});

// Zamykanie modala
closeBtn.addEventListener("click", () => modalOverlay.style.display = "none");
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = "none";
});