const appDiv = document.getElementById('app');
const API_BASE = '/api/users';

// Çerezden CSRF token'ı alma
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Sayfa Yükleme
function loadPage(page) {
    console.log('Loading page:', page);
    fetch(page)
        .then(response => response.text())
        .then(html => {
            appDiv.innerHTML = html;
            attachFormHandlers();
        })
        .catch(err => console.warn('Failed to load page', err));
}

// Profil Yükleme
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 401) {
            console.log('Access token expired, trying to refresh...');
            await refreshToken();
            const retryResponse = await fetch(`${API_BASE}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!retryResponse.ok) {
                throw new Error('Profile yüklenemedi.');
            }
            const data = await retryResponse.json();
            document.getElementById('username').textContent = data.user_data.username;
            document.getElementById('email').textContent = data.user_data.email;
            document.getElementById('twoFactor').checked = data.user_data.isActiveTwoFactor;
        } else if (!response.ok) {
            throw new Error('Profil yüklenemedi');
        } else {
            const data = await response.json();
            document.getElementById('username').textContent = data.user_data.username;
            document.getElementById('email').textContent = data.user_data.email;
            document.getElementById('twoFactor').checked = data.user_data.isActiveTwoFactor;
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        alert('Profil yüklenirken hata oluştu.');
    }
}

async function setTwoFactor() {
    const twoFactorSwitch = document.getElementById('twoFactor');
    const isActive = twoFactorSwitch.checked;  // Switch durumu
    try {
        const response = await fetch(`${API_BASE}/setTwoFactor/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'X-CSRFToken': getCookie('csrftoken')  // CSRF koruması
            },
            credentials: 'include',
            body: JSON.stringify({ enable_2fa: isActive })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Two-factor authentication updated!');
        } else {
            alert('Failed to update two-factor authentication.');
            twoFactorSwitch.checked = !isActive;  // Toggle'ı geri al
        }
    } catch (error) {
        console.error('Error updating two-factor authentication:', error);
        twoFactorSwitch.checked = !isActive;  // Hata olursa eski duruma döndür
    }
}

async function verifyTwoFactor() {
    const code = document.getElementById('twoFactorCode').value;

    try {
        const response = await fetch(`${API_BASE}/verifyTwoFactor/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
            },
            credentials: 'include',
            body: JSON.stringify({ code })  // Kod JSON formatında gönderiliyor
        });

        const data = await response.json();  // Yanıtı JSON olarak çözümle

        if (response.ok) {
            // Başarılı işlem
            alert('İki faktörlü doğrulama basarili!');
            loadPage('frontend_static/home.html');  // Home sayfasına yönlendir
        } else {
            // Başarısız işlem
            alert(data.error || 'Kod yanlış. Lütfen tekrar deneyin.');
        }
    } catch (error) {
        console.error('Doğrulama sırasında hata:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

async function getQrCodeImage() {
    try {
        const response = await fetch(`${API_BASE}/getQrCodeImage/`, {
            method: 'GET',  // GET metodu kullanıldı
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok && data.qr_code_url) {
            const qrCodeElement = document.getElementById('qrCodeImage');
            
            if (qrCodeElement) {
                qrCodeElement.src = data.qr_code_url;  // QR kodunu img etiketine yerleştir
            } else {
                console.warn('QR Kod yerleştirilecek element bulunamadı.');
            }
        } else {
            alert('QR kodu yüklenemedi.');
        }
    } catch (error) {
        console.error('QR kodu yüklenirken hata oluştu:', error);
    }
}

// Form İşlemleri
function attachFormHandlers() {
    // Login ve Register Yönlendirme
    document.getElementById('go-to-login')?.addEventListener('click', () => loadPage('frontend_static/login.html'));
    document.getElementById('go-to-register')?.addEventListener('click', () => loadPage('frontend_static/register.html'));

    // Logout
    document.getElementById('logout-button')?.addEventListener('click', () => {
        localStorage.removeItem('access');
        alert('Logged out successfully');
        loadPage('frontend_static/login.html');
    });

    // Profil Yükleme
    document.getElementById('profile-button')?.addEventListener('click', () => {
        loadPage('frontend_static/profile.html');
        loadUserProfile();
    });
    
    document.getElementById('show-qr')?.addEventListener('click', () => {
        loadPage('frontend_static/qr.html');
    });

    document.getElementById('claim-qr-code')?.addEventListener('click', () => {
        loadPage('frontend_static/profile.html');
        loadUserProfile();
    });

    document.getElementById('my-profile-button')?.addEventListener('click', openMyProfile);
    // Kod Dogrulama
    document.getElementById('verifyButtonTwoFactor')?.addEventListener('click', verifyTwoFactor);

    document.getElementById('twoFactor')?.addEventListener('change', () => setTwoFactor());

    const qrCodeElement = document.getElementById('qrCodeImage');
    if (qrCodeElement)
            getQrCodeImage();


    // Kayıt Formu
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target['register-username'].value;
            const email = e.target['register-email'].value;
            const password = e.target['register-password'].value;
            const csrfToken = getCookie('csrftoken');

            const response = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Registration successful');
                loadPage('frontend_static/login.html');
            } else {
                const data = await response.json();
                alert(data.error || 'Registration failed');
            }
        });
    }

    // Login Formu (Eksik Olan Kısım)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const csrfToken = getCookie('csrftoken');

            try {
                const response = await fetch(`${API_BASE}/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('access', data.access);
                    if (data.user.isActiveTwoFactor)// 2FA aktifse, kod doğrulama sayfasına yönlendir
                        loadPage('frontend_static/twoFactor.html');
                    else {
                        // 2FA aktif değilse doğrudan giriş yap
                        alert('Login successful');
                        loadPage('frontend_static/home.html');
                    }
                } else {
                    const error = await response.json();
                    alert(error.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Something went wrong.');
            }
        });
}

// Intra Login (42 Intra OAuth)
document.getElementById('intra-login-button')?.addEventListener('click', function() {
    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0d930db14b6e4ce5c5444d9e4a6ec2a7cbfebd777c72611065425e8de4f96f3d&redirect_uri=http%3A%2F%2Flocalhost%2F&response_type=code';
});
}

// CSRF Token Al
async function fetchCSRFToken() {
    const response = await fetch(`${API_BASE}/get-csrf-token/`, {
        method: 'GET',
        credentials: 'include',
    });

    if (response.ok) {
        const data = await response.json();
        console.log('CSRF Token:', data.csrfToken);
    } else {
        console.error('CSRF token isteği başarısız!');
    }
}

// Token Yenileme
async function refreshToken() {
    const response = await fetch(`${API_BASE}/refresh/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`,
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
    } else {
        console.error('Refresh token failed');
        localStorage.removeItem('access');
        loadPage('frontend_static/login.html');
    }
}

// Her 14 dakikada token yenileme
setInterval(refreshToken, 29 * 60 * 1000);

// Sayfa Yükleme Kontrolü (Oturum)
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Öncelikle CSRF token'ı al
    await fetchCSRFToken();

    if (code) {
        // Code varsa, OAuth callback işlemi başlat
        fetch(`${API_BASE}/login42/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')  // Çerezden CSRF token alınır
            },
            credentials: 'include',
            body: JSON.stringify({ code: code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                // Başarılı giriş, token'ı kaydet
                localStorage.setItem('access', data.access);
                window.history.replaceState({}, document.title, "/");  // URL'den ?code kaldır
                if (data.user.isActiveTwoFactor)
                    loadPage('frontend_static/twoFactor.html');
                else
                    loadPage('frontend_static/home.html');
            } else {
                alert('OAuth Login Failed');
                loadPage('frontend_static/login.html');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadPage('frontend_static/login.html');
        });
    } else {
        // Code yoksa, normal token kontrolü yap
        if (!token) {
            loadPage('frontend_static/login.html');
        } else {
            loadPage('frontend_static/home.html');
        }
    }
});

