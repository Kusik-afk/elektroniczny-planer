const calendarContainer = document.getElementById("calendar");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelector(".close-btn");
const saveBtn = document.getElementById("save-btn");
const taskInput = document.getElementById("task-input");
const dateDisplay = document.getElementById("selected-date");

const totalDays = 31;
let selectedDayNumber = null;

// Pobieramy ID zalogowanego użytkownika 
const currentUserId = localStorage.getItem("userId");

// Jeśli ktoś próbuje wejść bez logowania - wyrzuć go!
if (!currentUserId) {
   window.location.href = "login.html";
}

//Funkcja pobierająca zadania z serwera
async function loadTasksFromServer() {
    try {
        // Pytamy serwer: "Daj mi zadania użytkownika o tym ID"
        const response = await fetch(`/api/tasks/${currentUserId}`);
        const tasks = await response.json(); // To jest tablica zadań z bazy

        // Teraz musimy narysować te zadania w kalendarzu
        tasks.forEach(task => {
            // Znajdź kratkę odpowiedniego dnia 
            const dayBox = calendarContainer.children[task.day - 1];
            
            // Stwórz pasek zadania
            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task");
            taskDiv.innerText = task.text;
            
            dayBox.appendChild(taskDiv);
        });

    } catch (error) {
        console.error("Błąd pobierania zadań:", error);
    }
}

//GENEROWANIE KALENDARZA 
for (let day = 1; day <= totalDays; day++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day-box");
    dayBox.innerHTML = `<div class="day-number">${day}</div>`;

    dayBox.addEventListener("click", function() {
        selectedDayNumber = day;
        dateDisplay.innerText = "Dzień: " + day;
        modalOverlay.style.display = "flex";
    });

    calendarContainer.appendChild(dayBox);
}

// Wywołujemy pobieranie zadań dopiero PO narysowaniu pustego kalendarza
loadTasksFromServer();


//ZAPISYWANIE
saveBtn.addEventListener("click", async function() {
    const taskText = taskInput.value;
    if (taskText === "") return;

    // 1. Wysyłamy do serwera
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                day: selectedDayNumber,
                text: taskText
            })
        });

        if (response.ok) {
            // 2. Jeśli serwer zapisał, aktualizujemy widok u nas
            const dayBox = calendarContainer.children[selectedDayNumber - 1];
            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task");
            taskDiv.innerText = taskText;
            dayBox.appendChild(taskDiv);

            // Sprzątanie
            modalOverlay.style.display = "none";
            taskInput.value = "";
        } else {
            alert("Błąd zapisu na serwerze");
        }

    } catch (error) {
        console.error("Błąd sieci:", error);
    }
});

// Zamykanie modala
closeBtn.addEventListener("click", () => modalOverlay.style.display = "none");
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = "none";
});