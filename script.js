const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

// Funkcja pomocnicza do wysyłania danych
async function sendData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// 1. Obsługa REJESTRACJI
registerBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const result = await sendData('/api/register', { email, password });
    
    alert(result.message); // "Rejestracja udana" lub błąd
});

// 2. Obsługa LOGOWANIA
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    // Wysyłamy prośbę o logowanie
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        //Debugowanie start
        console.log("Odpowiedź serwera:", data);

        if (response.ok) {
            if (data.userId) {
                localStorage.setItem("userId", data.userId);
                alert("Witaj " + (data.name || "użytkowniku") + "!");
                window.location.href = "dashboard.html";
            } else {
                console.error("Błąd: serwer nie przysłał ID!");
                alert("Błąd logowania: brak Id użytkownika.")
            }
        } else {
            // BŁĄD 
            alert("Błąd: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia");
    }
});