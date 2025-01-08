const appDiv = document.getElementById('app');
const API_BASE = 'http://localhost:8000/users';

// Sayfa Yükleme Fonksiyonu
function loadPage(page) {
    console.log('Loading page:', page);
    fetch(page)
        .then(response => response.text())
        .then(html => {
            appDiv.innerHTML = html;
            attachFormHandlers();
            fetchCSRFToken();  // Sayfa yüklendiğinde CSRF token çek
        })
        .catch(err => console.warn('Failed to load page', err));
}

// CSRF Token Çekme Fonksiyonu
async function fetchCSRFToken() {
    const response = await fetch(`${API_BASE}/get-csrf-token/`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    document.cookie = `csrftoken=${data.csrfToken}; path=/`;  // CSRF token'ı çerez olarak set et
}

// Çerezden CSRF Token Çekme Fonksiyonu
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Sayfa Yönlendirme (Oturum Kontrolü)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access');
    if (token) {
        loadPage('static/home.html');
    } else {
        loadPage('static/login.html');
    }
});

// Kullanıcı Oturum Doğrulama (Token Kontrol)
async function checkUserAuth() {
    const token = localStorage.getItem('access');
    if (!token) {
        loadPage('login.html');
        return;
    }

    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${API_BASE}/userdetail/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken  // CSRF token ekleniyor
        },
        credentials: 'include'
    });

    if (response.status === 401 || response.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('access');
        loadPage('login.html');
    }
}

// Form İşlemleri ve API
function attachFormHandlers() {
    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
        goToLogin.addEventListener('click', () => loadPage('static/login.html'));
    }

    const goToRegister = document.getElementById('go-to-register');
    if (goToRegister) {
        goToRegister.addEventListener('click', () => loadPage('static/register.html'));
    }

    // Kayıt Formu (Register)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const csrftoken = getCookie('csrftoken');  // Çerezden CSRF token al

            const response = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken  // CSRF token başlığa ekleniyor
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful');
                loadPage('login.html');
            } else {
                alert(data.error || 'Registration failed');
            }
        });
    }

    // Giriş Formu (Login)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const csrftoken = getCookie('csrftoken');  // Çerezden CSRF token al

            const response = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken  // CSRF token ekleniyor
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('access', data.access);
                loadPage('home.html');
            } else {
                alert(data.detail || 'Login failed');
            }
        });
    }

    // Logout İşlemi
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('access');
            alert('Logged out successfully');
            loadPage('login.html');
        });
    }
}
