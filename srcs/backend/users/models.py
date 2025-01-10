import random, string, base64
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=255, unique=True)
    isActiveTwoFactor = models.BooleanField(default=False)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True)
    secret_key = models.CharField(max_length=64, blank=True, null=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)  # Arkadaşlar
    blocked_users = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='blocked_by_customuser',
        blank=True
    )
    friend_requests = models.ManyToManyField('self', symmetrical=False, related_name='pending_requests', blank=True)  # Arkadaşlık istekleri
    played_games = models.JSONField(default=list, blank=True)  # Oynanan oyunlar (JSON format)
    game_rank = models.IntegerField(default=0)  # Oyun sıralaması (başlangıç 0)
    game_requests = models.ManyToManyField('self', symmetrical=False, related_name='games_requests', blank=True)  # Oyun istekleri


    def generate_secret_key(self):
        if not self.secret_key:
            characters = string.ascii_uppercase + "234567"
            random_string = ''.join(random.choice(characters) for _ in range(32))
            self.secret_key = base64.b32encode(random_string.encode()).decode('utf-8')

            # Base32 padding ekleme
            self.secret_key = self.secret_key.rstrip('=')  # Fazla padding'i kaldır
            self.save()


    def __str__(self):
        return self.username
