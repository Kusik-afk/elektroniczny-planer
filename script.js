//const loginForm = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

//Funkcja pomocnicza do wysyłania danych
async function sendData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

//1. Obsługa rejestracji
registerBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const result = await sendData('/api/register', { email, password });

    alert(result.message);//rejestracja udana lub błąd
});

//2. Obsługa logowania
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    //Wysyłamy prośbę o logowanie
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if(response.ok) {
            //Sukces
            alert("Witaj " + (data.name || "użytkowniku") + "!");

            //Zapisujemy ID uzytkownika w LocalStorage, żeby wiedzieć, że jest zalogowany
            localStorage.setItem("userID", data.userId);

            //Przekierowanie do planera
            window.location.href = "dashboard.html";
        } else {
            //Błąd
            alert("Błąd: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia");
    }
})