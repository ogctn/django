from django.urls import re_path, path
from .consumers import GameSocketConsumer

websocket_urlpatterns = [
    path('ws/game/<str:room_id>/', GameSocketConsumer.as_asgi()),
]

