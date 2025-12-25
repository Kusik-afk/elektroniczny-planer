const calendarContainer = document.getElementById("calendar");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelector(".close-btn");
const saveBtn = document.getElementById("save-btn");
const taskInput = document.getElementById("task-input");
const dateDisplay = document.getElementById("selected-date");
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

const totalDays = 31;
let selectedDayNumber = null;

// Pobieramy ID zalogowanego użytkownika 
const currentUserId = localStorage.getItem("userId");

// Jeśli ktoś próbuje wejść bez logowania - wyrzuć go!
if (!currentUserId) {
   window.location.href = "login.html";
}

//FUNKCJA POBIERAJĄCA ZADANIA
async function loadTasksFromServer() {
    // Najpierw czyścimy kalendarz ze starych zadań, żeby się nie dublowały
    document.querySelectorAll(".task").forEach(el => el.remove());

    try {
        const response = await fetch(`/api/tasks/${currentUserId}`);
        const tasks = await response.json();

        tasks.forEach(task => {
            // Znajdź kratkę dnia
            const dayBox = calendarContainer.children[task.day - 1];
            
            if (dayBox) {
                // Tworzymy pasek zadania
                const taskDiv = document.createElement("div");
                taskDiv.classList.add("task");
                
                // Treść zadania
                const textSpan = document.createElement("span");
                textSpan.innerText = task.text;
                
                // Przycisk usuwania 
                const deleteBtn = document.createElement("span");
                deleteBtn.innerHTML = " &times;"; // Znak "x"
                deleteBtn.style.color = "red";
                deleteBtn.style.fontWeight = "bold";
                deleteBtn.style.cursor = "pointer";
                deleteBtn.style.marginLeft = "5px";
                
                // Co się dzieje jak klikniesz "X"?
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation(); // żeby nie otwierało się okienko dodawania (modal)
                    
                    if(confirm("Usunąć zadanie?")) {
                        await deleteTask(task._id); // Wywołujemy funkcję usuwania
                        taskDiv.remove(); // Usuwamy z ekranu
                    }
                };

                taskDiv.appendChild(textSpan);
                taskDiv.appendChild(deleteBtn);
                
                dayBox.appendChild(taskDiv);
            }
        });

    } catch (error) {
        console.error("Błąd pobierania zadań:", error);
    }
}

//NOWA FUNKCJA USUWAJĄCA Z BAZY
async function deleteTask(taskId) {
    try {
        await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error("Błąd usuwania:", error);
        alert("Nie udało się usunąć.");
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
            // 2. Odświeżamy wszystko
            loadTasksFromServer();

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

