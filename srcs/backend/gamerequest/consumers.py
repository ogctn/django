import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from users.models import CustomUser  # CustomUser modelini import edin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser

async def get_user_from_jwt(token):
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(token)
        user = await sync_to_async(jwt_auth.get_user)(validated_token)
        return user
    except (InvalidToken, TokenError):
        return AnonymousUser()

connected_users = {}

class GameRequestSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope["url_route"]["kwargs"]["token"]
        user = await get_user_from_jwt(token)
        if user.is_authenticated:
            connected_users[user.id] = self.channel_name
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user.is_authenticated:
            connected_users.pop(user.id, None)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["type"] == "send_request":
            token = self.scope["url_route"]["kwargs"]["token"]
            sender = await get_user_from_jwt(token)
            receiver_username = data["receiver"]
            receiver = await database_sync_to_async(CustomUser.objects.get)(username=receiver_username)
            if receiver and receiver.id in connected_users:
                channel_layer = get_channel_layer()
                await channel_layer.send(
                    connected_users[receiver.id],
                    {
                        'type': 'game_request',
                        'message': {
                            'type': 'game_request',
                            'sender': sender.username,
                        }
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    "error": "User is not connected."
                }))
        elif data["type"] == "accept_request":
            token = self.scope["url_route"]["kwargs"]["token"]
            sender = await get_user_from_jwt(token)
            receiver_username = data["receiver"]
            receiver = await database_sync_to_async(CustomUser.objects.get)(username=receiver_username)
            if receiver and receiver.id in connected_users:
                channel_layer = get_channel_layer()
                await channel_layer.send(
                    connected_users[receiver.id],
                    {
                        'type': 'accept_request',
                        'message': {
                            'type': 'accept_request',
                            'sender': sender.username,
                            'uid': data["uid"],
                        }
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    "error": "User is not connected."
                }))

    async def game_request(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def accept_request(self, event):
        await self.send(text_data=json.dumps(event['message']))
