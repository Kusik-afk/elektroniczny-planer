const loginForm = document.querySelector("form");
const emailInput = document.querySelector("input[type='text']");
const passwordInput = document.querySelector("input[type='password']");

loginForm.addEventListener("submit", function(event) {
    //1. Zatrzymujemy domyślne odświeżenie strony
    event.preventDefault();

    //2. Pobieramy to, co wpisał użytkownik
    const email = emailInput.value;
    const password = passwordInput.value;

    //3. Sprawdzamy, czy dane są poprawne
    if (email === "admin" && password === "tajne") {
        alert("Logowanie udane!");
        window.location.href = "dashboard.html";
    } else {
        alert("Błąd! Niepoprawny email lub hasło.");
    }
});