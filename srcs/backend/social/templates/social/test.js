document.addEventListener("DOMContentLoaded", () => {
    const userIdInput = document.getElementById('user-id');
    const friendButton = document.getElementById('friend-button');
    const followButton = document.getElementById('follow-button');
    const blockButton = document.getElementById('block-button');
    const resultMessage = document.getElementById('result-message');
  
    const currentUserId = document.getElementById('current-user-id').textContent.split(': ')[1];
  
    // Buton işlevleri
    friendButton.addEventListener('click', () => handleAction('friend', userIdInput.value));
    followButton.addEventListener('click', () => handleAction('follow', userIdInput.value));
    blockButton.addEventListener('click', () => handleAction('block', userIdInput.value));
  
    // Genel işlem fonksiyonu
    async function handleAction(action, targetUserId) {
      if (!targetUserId || targetUserId === currentUserId) {
        resultMessage.textContent = 'Geçersiz işlem. Kendi ID\'nizi giremezsiniz!';
        return;
      }
  
      const response = await fetch(`/api/${action}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify({ [action + 'ed']: targetUserId })
      });
  
      const data = await response.json();
      if (response.ok) {
        resultMessage.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} işlemi başarılı!`;
        fetchUserData();  // Tabloyu güncelle
      } else {
        resultMessage.textContent = `Hata: ${data.detail || 'İşlem başarısız'}`;
      }
    }
  
    // Kullanıcı verilerini getirme ve tabloyu güncelleme
    async function fetchUserData() {
      const response = await fetch(`/api/user-data/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
      });
  
      const data = await response.json();
      document.getElementById('friends-list').textContent = data.friends.join(', ');
      document.getElementById('following-list').textContent = data.following.join(', ');
      document.getElementById('followers-list').textContent = data.followers.join(', ');
      document.getElementById('blocked-list').textContent = data.blocked.join(', ');
      document.getElementById('blocked-by-list').textContent = data.blocked_by.join(', ');
    }
  
    fetchUserData();  // Sayfa yüklenince kullanıcı verilerini al
  });
  
  // CSRF Token alma fonksiyonu
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  