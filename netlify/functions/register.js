async function register() {
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    const passwordHash = CryptoJS.SHA256(password).toString();

    try {
        const response = await fetch('/.netlify/functions/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, passwordHash })
        });

        if (response.ok) {
            alert('Регистрация успешна! Теперь вы можете войти.');
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            errorMessage.textContent = data.error || 'Ошибка регистрации';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Ошибка подключения к серверу: ' + error.message;
        errorMessage.style.display = 'block';
    }
}
