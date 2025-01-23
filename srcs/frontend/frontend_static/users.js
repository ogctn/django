import { initSocket } from "./index.js";

const token = localStorage.getItem('access');


const socket = new WebSocket(`wss://10.11.244.64/ws/gamerequest/${token}/`);

socket.onopen = () => {
};

socket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		if (data.type === "game_request") {
				const gameRequestList = document.getElementById('game-requests');
				if (!gameRequestList) document.getElementById('requests-button')?.click()
				gameRequestList.innerHTML = ''; // Listeyi temizle

				const li = document.createElement('li');
				li.textContent = `${data.sender}`;

				const acceptButton = document.createElement('button');
				acceptButton.textContent = 'Accept Game Request';
				acceptButton.classList.add('accept-game');
				acceptButton.addEventListener('click', async () => {
						await acceptGameRequest(data.sender);
				});
				li.appendChild(acceptButton);
				const declineButton = document.createElement('button');
				declineButton.textContent = 'Decline Game Request';
				declineButton.classList.add('decline-game');
				declineButton.addEventListener('click', async () => {
				});
				li.appendChild(declineButton);
				gameRequestList.appendChild(li);
		} else if (data.type === "accept_request") {
				loadPage('frontend_static/game.html')
				initSocket(data.uid);
		}
};

socket.onclose = () => {
    console.log("WebSocket bağlantısı kapandı.");
};

async function sendGameRequest(username) {
		console.log(username);
		socket.send(
				JSON.stringify({
						type: "send_request",
						receiver: username,
				})
		);
}

async function acceptGameRequest(username) {
		const uid = crypto.randomUUID()
		socket.send(
				JSON.stringify({
						type: "accept_request",
						receiver: username,
						uid: uid,
				})
		);
		loadPage('frontend_static/game.html')
    initSocket(uid);
}

async function declineGameRequest(username) {
		console.log(username);
		socket.send(
				JSON.stringify({
						type: "decline_request",
						receiver: username,
				})
		);
}

const appDiv = document.getElementById('app');
const API_BASE = '/api/users';
const API_URLS = {
    sent: '/api/social/friend/sent-requests/',
    received: '/api/social/friend/received-requests/',
    all: '/api/social/friend/all-requests/',
    addFriend: '/api/social/friend/request/' // Arkadaşlık isteği gönderme
};

// Çerezden CSRF token'ı alma
export function getCookie(name) {
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
            if (page == 'frontend_static/game.html') {
                initSocket();
            }
        })
        .catch(err => console.warn('Failed to load page', err));
}

function saveGameData(gameData) {
    fetch('/api/dashboard/save_game_data/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`, // Token ile yetkilendirme
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // CSRF koruması için
        },
        credentials: 'include',
        body: JSON.stringify(gameData) // GameData'yı JSON olarak gönderiyoruz
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Oyun verisi kaydedilemedi');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Oyun verisi başarıyla kaydedildi:', data);
            // Veriler kaydedildikten sonra dashboard'u yükle
            loadDashBoard();
        })
        .catch((error) => {
            console.error('Hata:', error);
        });
}

function loadDashBoard() {
    // API endpoint'i ve kullanıcı adı sorgusu
    fetch(`/api/dashboard/get_user_profile_stats/`, {
        method: 'GET', // Ya da GET, backend API'nize göre değişebilir
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Veriler alınamadı');
            }
            return response.json();
        })
        .then((data) => {
            if (data && data.data) {
                const stats = data.data;

                // HTML'deki alanları doldur
                document.getElementById('stat-username').textContent = stats.username || '-';
                document.getElementById('stat-total-wins').textContent = stats.total_wins || '0';
                document.getElementById('stat-total-games').textContent = stats.total_games || '0';
                document.getElementById('stat-casual-rating').textContent = stats.casual_rating || '0';
                document.getElementById('stat-tournament-rating').textContent = stats.tournament_rating || '0';
                document.getElementById('stat-goals-scored').textContent = stats.goals_scored || '0';
                document.getElementById('stat-goals-conceded').textContent = stats.goals_conceded || '0';
                document.getElementById('stat-win-rate').textContent = (stats.win_rate * 100).toFixed(2) + '%' || '0%';
                document.getElementById('stat-streak').textContent = stats.streak || '0';
            } else {
                console.error('Beklenmedik veri formatı:', data);
            }
        })
        .catch((error) => {
            console.error('Hata:', error);
        });
}

async function fetchAndUpdate(url, listId) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${url}:`, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Gelen veri:", data);

        const listElement = document.getElementById(listId);
        if (!listElement) {
            console.warn(`List element with ID '${listId}' not found.`);
            return;
        }

        listElement.innerHTML = ''; // Listeyi temizle

        const mapping = {
            'sent-requests': 'sent-requests',
            'received-requests': 'received-requests',
            'all-requests': null
        };

        const key = mapping[listId];
        let requests = [];

        if (key === null) {
            requests = [...(data['sent-requests'] || []), ...(data['received-requests'] || [])];
        } else {
            requests = data[key];
        }

        console.log("Listelenecek veriler:", requests);

        if (requests && requests.length > 0) {
            requests.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.username || 'Unknown User'} - ${item.request_date ? new Date(item.request_date).toLocaleString() : 'No date available'}`;

                // Cancel butonu ekleme
                if (listId === 'sent-requests') {
                    const cancelButton = document.createElement('button');
                    cancelButton.textContent = 'Cancel';
                    cancelButton.classList.add('cancel-request');
                    cancelButton.addEventListener('click', async () => {
                        const success = await cancelRequest(item.username);
                        if (success) {
                            fetchAndUpdate(url, listId); // Listeyi güncelle
                        }
                    });
                    li.appendChild(cancelButton);
                }

                // Accept ve Decline butonları ekleme
                if (listId === 'received-requests') {
                    const acceptButton = document.createElement('button');
                    acceptButton.textContent = 'Accept';
                    acceptButton.classList.add('accept-request');
                    acceptButton.addEventListener('click', async () => {
                        const success = await acceptRequest(item.username);
                        if (success) {
                            fetchAndUpdate(url, listId); // Listeyi güncelle
                        }
                    });

                    const declineButton = document.createElement('button');
                    declineButton.textContent = 'Decline';
                    declineButton.classList.add('decline-request');
                    declineButton.addEventListener('click', async () => {
                        const success = await declineRequest(item.username);
                        if (success) {
                            fetchAndUpdate(url, listId); // Listeyi güncelle
                        }
                    });

                    li.appendChild(acceptButton);
                    li.appendChild(declineButton);
                }

                listElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No requests available.';
            listElement.appendChild(li);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function cancelRequest(username) {
    try {
        const response = await fetch('/api/social/friend/cancel/', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: username })
        });

        if (response.ok) {
            alert(`${username} için arkadaşlık isteği iptal edildi.`);
            return true;
        } else {
            const error = await response.json();
            alert(`Hata: ${error.message || 'İstek iptal edilemedi.'}`);
            return false;
        }
    } catch (error) {
        console.error('Cancel request error:', error);
        return false;
    }
}

async function acceptRequest(username) {
    try {
        const response = await fetch('/api/social/friend/accept/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: username })
        });

        if (response.ok) {
            alert(`${username} arkadaşlık isteği kabul edildi.`);
            return true;
        } else {
            const error = await response.json();
            alert(`Hata: ${error.message || 'İstek kabul edilemedi.'}`);
            return false;
        }
    } catch (error) {
        console.error('Accept request error:', error);
        return false;
    }
}

async function declineRequest(username) {
    try {
        const response = await fetch('/api/social/friend/delete/', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: username })
        });

        if (response.ok) {
            alert(`${username} arkadaşlık isteği reddedildi.`);
            return true;
        } else {
            const error = await response.json();
            alert(`Hata: ${error.message || 'İstek reddedilemedi.'}`);
            return false;
        }
    } catch (error) {
        console.error('Decline request error:', error);
        return false;
    }
}

async function fetchFriendList() {
    try {
        const response = await fetch('/api/social/friend/list-friends/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (response.ok) { 
            const data = await response.json();
            const friendList = document.getElementById('friends');
            friendList.innerHTML = ''; // Listeyi temizle

            data.friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = `${friend.username} - ${new Date(friend.friendship_date).toLocaleString()}`;

								const blockButton = document.createElement('button');
								blockButton.textContent = 'Block';
								blockButton.classList.add('block-user');
								blockButton.addEventListener('click', async () => {
										const success = await blockUser(friend.username);
										if (success) {
												fetchFriendList(); // Listeyi güncelle
												fetchBlockedList();
										}
								});
								li.appendChild(blockButton);
								const gameRequestButton = document.createElement('button');
								gameRequestButton.textContent = 'Send Game Request';
								gameRequestButton.classList.add('game-request');
								gameRequestButton.addEventListener('click', async () => {
										await sendGameRequest(friend.username);
								});
								li.appendChild(gameRequestButton);
								friendList.appendChild(li);
						});
        } else {
            console.error('Failed to fetch friend list:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching friend list:', error);
    }
}

async function fetchBlockedList() {
    try {
        const response = await fetch('/api/social/block/blocked-users/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            const blockedList = document.getElementById('blocked-users');
            blockedList.innerHTML = ''; // Listeyi temizle

            data['blocked-users'].forEach(blockedUser => {
                const li = document.createElement('li');
                li.textContent = `${blockedUser.username} - ${new Date(blockedUser.blocked_at).toLocaleString()}`;

                const unblockButton = document.createElement('button');
                unblockButton.textContent = 'Unblock';
                unblockButton.classList.add('unblock-user');
                unblockButton.addEventListener('click', async () => {
                    const success = await unblockUser(blockedUser.username);
                    if (success) {
                        fetchBlockedList(); // Listeyi güncelle
                    }
                });

                li.appendChild(unblockButton);
                blockedList.appendChild(li);
            });
        } else {
            console.error('Failed to fetch blocked list:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching blocked list:', error);
    }
}

async function blockUser(username) {
    try {
        const response = await fetch('/api/social/block/block/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: username })
        });

        if (response.ok) {
            alert(`${username} has been blocked.`);
            return true;
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Could not block user.'}`);
            return false;
        }
    } catch (error) {
        console.error('Error blocking user:', error);
        return false;
    }
}

async function unblockUser(username) {
    try {
        const response = await fetch('/api/social/block/unblock/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: username })
        });

        if (response.ok) {
            alert(`${username} has been unblocked.`);
            return true;
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Could not unblock user.'}`);
            return false;
        }
    } catch (error) {
        console.error('Error unblocking user:', error);
        return false;
    }
}

// Tüm liste kutularını güncelleyen fonksiyon
function updateAllLists() {
    // Mevcut istek listelerini güncelle
    fetchAndUpdate(API_URLS.sent, 'sent-requests');
    fetchAndUpdate(API_URLS.received, 'received-requests');
    fetchAndUpdate(API_URLS.all, 'all-requests');

    fetchFriendList();
    fetchBlockedList();
}

// Profil Yükleme
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
        });

        if (response.status === 401) {
            console.log('Access token expired, trying to refresh...');
            await refreshToken();
            const retryResponse = await fetch(`${API_BASE}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'include',

            });
            if (!retryResponse.ok) {
                throw new Error('Profile yüklenemedi.');
            }
            const data = await retryResponse.json();
            document.getElementById('username').textContent = data.user_data.username;
            document.getElementById('email').textContent = data.user_data.email;
            document.getElementById('twoFactor').checked = data.user_data.isActiveTwoFactor;
            document.getElementById('profile-pic').src = data.user_data.profile_picture;
        } else if (!response.ok) {
            throw new Error('Profil yüklenemedi');
        } else {
            const data = await response.json();
            document.getElementById('username').textContent = data.user_data.username;
            document.getElementById('email').textContent = data.user_data.email;
            document.getElementById('twoFactor').checked = data.user_data.isActiveTwoFactor;
            document.getElementById('profile-pic').src = data.user_data.profile_picture;
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        alert('Profil yüklenirken hata oluştu.');
    }
}

async function loadOtherProfileView(user) {
    console.log('Loading page:', "frontend_static/otherProfile.html");
    const appDiv = document.getElementById('app');
    fetch("frontend_static/otherProfile.html")
        .then(response => response.text())
        .then(html => {
            appDiv.innerHTML = html;
            attachFormHandlers();

            if (user) {
                // DOM'daki elementlere erişim
                const usernameElement = document.getElementById('profile-username');
                const emailElement = document.getElementById('profile-email');
                const aboutElement = document.getElementById('profile-about');
                const friendRequestButton = document.getElementById('request-friend');
        
                // Elemanların DOM'da olup olmadığını kontrol edin
                if (usernameElement && emailElement && aboutElement) {
                    usernameElement.textContent = user.username;
                    emailElement.textContent = user.email;
                    aboutElement.textContent = user.about || 'Bilgi yok';

                    if (friendRequestButton) {
                        friendRequestButton.addEventListener('click', () => {
                            sendFriendRequest(user.username); // İstek gönder
                        });
                    }

                } else {
                    console.error('Profil elemanları bulunamadı.');
                }
            } else {
                alert('Kullanıcı bilgileri alınamadı.');
            }
        })
        .catch(err => console.warn('Failed to load page', err));
}

async function sendFriendRequest(targetUsername) {
    try {
        console.log("Arkadaşlık isteği gönderiliyor:", targetUsername);
        const response = await fetch(API_URLS.addFriend, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'include',
            body: JSON.stringify({ target_name: targetUsername }) // Backend'in beklediği veri
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Arkadaşlık isteği başarıyla gönderildi: ${data.message}`);
        } else if (response.status === 400) {
            const error = await response.json();
            alert(`Hata: ${error.message || 'Arkadaşlık isteği gönderilemedi.'}`);
        } else {
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Bir hata meydana geldi. Lütfen tekrar deneyin.');
    }
}

async function searchUser() {
    const searchQuery = document.getElementById('search-input').value.trim();  // Input'taki metni al

    if (!searchQuery) {
        alert('Lütfen bir kullanıcı adı girin.');
        return;
    }

    try {
        // Backend'e kullanıcı arama isteği gönder
        const response = await fetch(`${API_BASE}/search/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,  // Authorization header'ı ile token gönder
                'X-CSRFToken': getCookie('csrftoken')  // CSRF token
            },
            credentials: 'include',
            body: JSON.stringify({ username: searchQuery })  // Gönderilen veri
        });

        if (response.ok) {
            const data = await response.json();

            if (data.is_self === true) {
                loadPage('frontend_static/profile.html');
                loadUserProfile();
            }
            else if (data.users && data.users.length > 0) {
                loadOtherProfileView(data.users[0]);
            } else {
                alert('Hiçbir kullanıcı bulunamadı.');
            }
        } else if (response.status === 401) {
            alert('Yetkilendirme hatası. Lütfen giriş yapın.');
        } else {
            alert(`Hata oluştu: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Arama sırasında bir hata oluştu:', error);
        alert('Bir hata oluştu, lütfen tekrar deneyin.');
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

async function fetchUserBio() {
    try {
        const response = await fetch(`${API_BASE}/user-bio/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('bio-text').value = data.bio || '';  // Bio yoksa boş bırak
        } else {
            console.warn('Bio yüklenirken hata oluştu.');
        }
    } catch (error) {
        console.error('Bio yüklenirken hata oluştu:', error);
    }
}
// Form İşlemleri
function attachFormHandlers() {


    
    document.getElementById('dashboard-button')?.addEventListener('click', () => {
        loadPage('frontend_static/dashboard.html')
        const gameData = {
            game_type: "casual", // casual veya tournament
            player1_name: "mkati", // Oyuncu 1 kullanıcı adı
            player2_name: "medayi", // Oyuncu 2 kullanıcı adı
            player1_goals: 4, // Oyuncu 1 gol sayısı
            player2_goals: 2, // Oyuncu 2 gol sayısı
            game_date: "2025-01-21", // Tarih
            game_played_time: 14.5 // Oyun süresi
        };
        saveGameData(gameData);
    });

    document.getElementById('pong-game')?.addEventListener('click', () => loadPage('frontend_static/game.html'));

    if (document.getElementById('sent-requests') || document.getElementById('received-requests') || document.getElementById('all-requests')) {
        updateAllLists(); // İlk güncelleme
        setInterval(updateAllLists, 10000); // 10 saniyede bir güncelle
    }
    // Login ve Register Yönlendirme
    document.getElementById('go-to-login')?.addEventListener('click', () => loadPage('frontend_static/login.html'));
    document.getElementById('go-to-register')?.addEventListener('click', () => loadPage('frontend_static/register.html'));

    // Logout
    document.getElementById('logout-button')?.addEventListener('click', async () => {
        try {
            // Backend'e logout isteği at
            const response = await fetch(`${API_BASE}/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'include', // Cookie'leri dahil etmek için
            });
    
            if (response.ok) {
                // LocalStorage'dan token kaldır
                localStorage.removeItem('access');
                
                // Kullanıcıya mesaj göster
                alert('Logged out successfully');
                
                // Login sayfasına yönlendir
                loadPage('frontend_static/login.html');
            } else {
                const data = await response.json();
                alert(`Logout failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred while logging out.');
        }
    });

    // Profil Yükleme
    document.getElementById('profile-button')?.addEventListener('click', () => {
        loadPage('frontend_static/profile.html');
        loadUserProfile();
    });

    document.getElementById('home-button')?.addEventListener('click', () =>{
        loadPage('frontend_static/home.html');
    })
    
    document.getElementById('show-qr')?.addEventListener('click', () => {
        loadPage('frontend_static/qr.html');
    });

    document.getElementById('claim-qr-code')?.addEventListener('click', () => {
        loadPage('frontend_static/profile.html');
        loadUserProfile();
    });

    document.getElementById('search-button')?.addEventListener('click', searchUser);

    document.getElementById('requests-button')?.addEventListener('click', () => {
        loadPage('frontend_static/requests.html');
    });

    document.getElementById('save-bio')?.addEventListener('click', async () => {
        const bioText = document.getElementById('bio-text').value;
    
        if (!bioText) {
            alert('Lütfen bio alanını doldurun.');
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE}/update-bio/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                },
                body: JSON.stringify({ bio: bioText })  // Bio bilgisini JSON olarak gönder
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Bio başarıyla güncellendi!');
                // Güncellenen bio bilgisini doğrudan sayfada göster
                document.getElementById('bio-text').value = data.bio;
            } else {
                alert(data.error || 'Bio güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Bio güncellenirken hata oluştu:', error);
            alert('Bir hata meydana geldi. Lütfen tekrar deneyin.');
        }
    });

    if (document.getElementById('bio-text'))
    {
        fetchUserBio();
    }
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
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0d930db14b6e4ce5c5444d9e4a6ec2a7cbfebd777c72611065425e8de4f96f3d&redirect_uri=http%3A%2F%2F10.11.244.78%2F&response_type=code';
    });

    const confirmUploadButton = document.getElementById('confirm-upload');
    if (confirmUploadButton) {
        confirmUploadButton.addEventListener('click', async function () {
            const profilePicUrl = document.getElementById('upload-pic-url').value;

            if (!profilePicUrl) {
                alert('Lütfen bir resim URL\'si girin.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/upload-profile-pic/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    credentials: 'include',
                    body: JSON.stringify({ profile_picture: profilePicUrl })
                });

                const data = await response.json();

                if (response.ok) {
                    const profilePicElement = document.getElementById('profile-pic');
                    profilePicElement.src = data.profile_picture;
                    alert('Profil fotoğrafı başarıyla güncellendi!');
                } else {
                    alert(data.error || 'Resim yüklenirken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Profil fotoğrafı güncellenirken hata oluştu:', error);
                alert('Bir hata meydana geldi. Lütfen tekrar deneyin.');
            }
        });
    }
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

    const friendRequestButton = document.getElementById('request-friend');
    const targetUsernameElement = document.getElementById('profile-username');

    if (friendRequestButton && targetUsernameElement) {
        friendRequestButton.addEventListener('click', () => {
            const targetUsername = targetUsernameElement.textContent.trim(); // Kullanıcı adını al
            if (targetUsername) {
                sendFriendRequest(targetUsername); // Fonksiyonu çağır
            } else {
                alert('Hedef kullanıcı adı bulunamadı.');
            }
        });
    }

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
        // Code yoksa, token kontrolü yap
        if (!token) {
            loadPage('frontend_static/login.html');
        } else {
            // Token'in geçerliliğini kontrol et
            fetch(`${API_BASE}/verify-token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
                body: JSON.stringify({ token: localStorage.getItem('access') }),
            })
            .then(response => {
                if (response.ok) {
                    // Token geçerli, ana sayfayı yükle
                    loadPage('frontend_static/home.html');
                } else {
                    // Token geçersiz, giriş sayfasına yönlendir
                    localStorage.removeItem('access');
                    loadPage('frontend_static/login.html');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                localStorage.removeItem('access');
                loadPage('frontend_static/login.html');
            });
        }
    }
});
