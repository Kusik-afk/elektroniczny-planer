//const loginForm = document.querySelector("form");
const emailInput = document.querySelector("input[type='text']");
const passwordInput = document.querySelector("input[type='password']");
const registerBtn = document.getElementById("register-btn");

registerBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if(!email || !password) {
        alert("Wpisz email i hasło!");
        return;
    }

    // WYSYŁAMY DANE DO NASZEGO SERWERA
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Mówimy serwerowi: wysyłam JSON
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });

        // Odbieramy odpowiedź z serwera
        const data = await response.json();

        if (response.ok) {
            alert("Sukces: " + data.message);
            // Tu można przekierować do logowania
        } else {
            alert("Błąd: " + data.message);
        }

    } catch (error) {
        console.error("Błąd sieci:", error);
        alert("Nie udało się połączyć z serwerem.");
    }
});
// loginForm.addEventListener("submit", function(event) {
//     //1. Zatrzymujemy domyślne odświeżenie strony
//     event.preventDefault();

//     //2. Pobieramy to, co wpisał użytkownik
//     const email = emailInput.value;
//     const password = passwordInput.value;

//     //3. Sprawdzamy, czy dane są poprawne
//     if (email === "admin" && password === "tajne") {
//         alert("Logowanie udane!");
//         window.location.href = "dashboard.html";
//     } else {
//         alert("Błąd! Niepoprawny email lub hasło.");
//     }
// });