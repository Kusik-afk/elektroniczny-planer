//1. POBIERANIE ELEMENTÓW

// Pudełka 
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");

// Linki przełączające
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

// Pola LOGOWANIA
const emailLoginInput = document.getElementById("email-login");
const passwordLoginInput = document.getElementById("password-login");
const loginBtn = document.getElementById("login-btn");

// Pola REJESTRACJI
const nameRegInput = document.getElementById("name-reg");
const emailRegInput = document.getElementById("email-reg");
const passwordRegInput = document.getElementById("password-reg");
const registerBtn = document.getElementById("register-btn");


//2. OBSŁUGA PRZEŁĄCZANIA WIDOKÓW

// Pokaż Rejestrację
showRegisterLink.addEventListener("click", () => {
    loginBox.classList.add("hidden");    // Ukryj logowanie
    registerBox.classList.remove("hidden"); // Pokaż rejestrację
});

// Pokaż Logowanie
showLoginLink.addEventListener("click", () => {
    registerBox.classList.add("hidden");    // Ukryj rejestrację
    loginBox.classList.remove("hidden");    // Pokaż logowanie
});


//3. OBSŁUGA LOGOWANIA
loginBtn.addEventListener("click", async () => {
    // Blokada przycisku 
    loginBtn.disabled = true;
    const originalText = loginBtn.innerText;
    loginBtn.innerText = "⏳ Logowanie...";

    const email = emailLoginInput.value;
    const password = passwordLoginInput.value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("userId", data.userId);
            // Zapisz imię jeśli serwer je zwrócił
            if(data.name) {
                localStorage.setItem("userProfile", JSON.stringify({ name: data.name }));
            }
            window.location.href = "dashboard.html";
        } else {
            alert("Błąd: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia z serwerem");
    } finally {
        // Zawsze przywróć przycisk
        loginBtn.disabled = false;
        loginBtn.innerText = originalText;
    }
});


//4. OBSŁUGA REJESTRACJI
registerBtn.addEventListener("click", async () => {
    registerBtn.disabled = true;
    const originalText = registerBtn.innerText;
    registerBtn.innerText = "⏳ Zakładanie konta...";

    const name = nameRegInput.value;
    const email = emailRegInput.value;
    const password = passwordRegInput.value;

    // Szybka walidacja
    if (!name || !email || !password) {
        alert("Wypełnij wszystkie pola!");
        registerBtn.disabled = false;
        registerBtn.innerText = originalText;
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();

        if (response.ok) {
            alert("Konto założone! Teraz możesz się zalogować.");
            // Automatycznie przełącz na ekran logowania
            registerBox.classList.add("hidden");
            loginBox.classList.remove("hidden");
            // Przepisz email, żeby użytkownik nie musiał wpisywać ponownie
            emailLoginInput.value = email; 
        } else {
            alert("Błąd: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia z serwerem");
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerText = originalText;
    }
});