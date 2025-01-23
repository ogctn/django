import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from .gamestate import GameState
from .player import Player
from .ball import Ball
from .paddle import Paddle
import asyncio

GAME_WAITING = 0
GAME_RUNNING = 1
GAME_OVER = 2

rooms = dict()

class GameSocketConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept() # Accept the connection
        self.room_id = self.scope['url_route']['kwargs']['room_id'] 
        if self.room_id not in rooms: # If the room does not exist, create it
            await self.create_game()
        game_state = await self.get_game_state()
        if len(game_state.players) < 2: # If there are less than 2 players, add the player
            if len(game_state.players) == 0: # If there are less than 2 players, add the player
                game_state.add_player(Player(self.channel_name, 'right', Paddle((490, 250))))
                await self.player_accept(game_state.players[0])
            elif len(game_state.players) == 1:
                if game_state.players[0].side == 'right':
                    game_state.add_player(Player(self.channel_name, 'left', Paddle((10, 250))))
                else:
                    game_state.add_player(Player(self.channel_name, 'right', Paddle((10, 250))))
                await self.channel_layer.group_add(
                    self.room_id,
                    self.channel_name
                )
                await self.player_accept(game_state.players[1])

    async def disconnect(self, close_code):
        game_state = await self.get_game_state()
        game_state.remove_player(self.channel_name)
        await self.channel_layer.group_discard(
            self.room_id,
            self.channel_name
        )
        if len(game_state.players) == 0:
            del rooms[self.room_id]['game_state']
            del rooms[self.room_id]

    async def create_game(self):
        try:
            self.room_id = self.scope['url_route']['kwargs']['room_id'] 
            self.game_state = GameState(self.room_id, self.channel_layer)
        except:
            await self.close()
        await self.channel_layer.group_add(
            self.room_id,
            self.channel_name
        )
        rooms[self.room_id] = {}
        rooms[self.room_id]['game_state'] = self.game_state

    async def player_accept(self, player):
        await self.send(text_data=json.dumps({
            'type': 'player_accept',
            'player_id': player.channel_name,
            'side': player.side,
            'paddle': player.paddle.position[1],
        }))

    async def boradcast_player_movement(self, player):
        await self.channel_layer.group_send(
            self.room_id,
            {
                'type': 'player_movement',
                'message': {
                    'type': 'player_movement',
                    'side': player.side,
                    'paddle': player.paddle.position[1],
                }
            }
        )


    async def start_game(self):
        game_state = await self.get_game_state()
        if game_state.game_status != GAME_RUNNING:
            game_state.game_status = GAME_RUNNING
            game_state.ball = Ball([300, 600])
            await self.channel_layer.group_send(
                self.room_id,
                {
                    'type': 'game_start',
                    'message': {
                        'type': 'game_status',
                        'status': 'start',
                    }
                }
            )
            asyncio.create_task(self.broadcast_ball_movement())

    async def broadcast_ball_movement(self):
        game_state = await self.get_game_state()
        while game_state.game_status == GAME_RUNNING:
            game_state.ball.update_ball()
            game_state.ball.check_collision()
            goal = game_state.ball.check_goal(game_state.players)
            if goal != -1:
                game_state.players[goal].score += 1
                if game_state.players[goal].score == 3:
                    game_state.game_status = GAME_OVER
                    await self.channel_layer.group_send(
                        self.room_id,
                        {
                            'type': 'score_update',
                            'message': {
                                'type': 'score_update',
                                'side': game_state.players[goal].side,
                                'score': game_state.players[goal].score,
                            }
                        }
                    )
                    await self.channel_layer.group_send(
                        self.room_id,
                        {
                            'type': 'game_over',
                            'message': {
                                'type': 'game_status',
                                'status': 'over',
                                'winner': game_state.players[goal].side,
                            }
                        }
                    )
                    game_state.ball.reset_ball()
                    await self.channel_layer.group_send(
                        self.room_id,
                        {
                            'type': 'ball_update',
                            'message': {
                                'type': 'ball_movement',
                                'position': game_state.ball.position,
                            }
                        }
                    )
                    break
                await self.channel_layer.group_send(
                    self.room_id,
                    {
                        'type': 'score_update',
                        'message': {
                            'type': 'score_update',
                            'side': game_state.players[goal].side,
                            'score': game_state.players[goal].score,
                        }
                    }
                )
                game_state.ball.reset_ball()
            await self.channel_layer.group_send(
                self.room_id,
                {
                    'type': 'ball_update',
                    'message': {
                        'type': 'ball_movement',
                        'position': game_state.ball.position,
                    }
                }
            )
            await asyncio.sleep(0.01)

    async def receive(self, text_data):
        game_state = await self.get_game_state()
        data_json = json.loads(text_data)
        if data_json['type'] == 'player_move':
            player = game_state.get_player(data_json['player_id'])
            player.paddle.move(data_json['direction'])
            await self.boradcast_player_movement(player)
        if data_json['type'] == 'player_ready':
            player = game_state.get_player(data_json['player_id'])
            player.ready = True
            if game_state.players[0].ready and game_state.players[1].ready:
                await self.start_game()

    async def player_movement(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def game_over(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def ball_update(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def score_update(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def get_game_state(self):
        return rooms[self.room_id]['game_state']
