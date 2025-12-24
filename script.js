const nameInput = document.getElementById("name-reg");//pole do wpisywania imienia
const emailInput = document.getElementById("email");//pole do wpisywania maila
const passwordInput = document.getElementById("password");//pole do wpisywania hasła
const loginBtn = document.getElementById("login-btn");//przycisk zaloguj się
const registerBtn = document.getElementById("register-btn");//przycisk zarejestruj się

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
    // Pobieramy wartości
    const name = nameInput.value; 
    const email = emailInput.value;
    const password = passwordInput.value;

    // Wysyłamy do serwera 
    const result = await sendData('/api/register', { 
        name: name, 
        email: email, 
        password: password 
    });
    
    alert(result.message);
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