GAME_WAITING = 0
GAME_RUNNING = 1
GAME_OVER = 2

class GameState:
    def __init__(self, room_id, channel_layer):
        self.room_id = room_id
        self.channel_layer = channel_layer
        self.game_status = GAME_WAITING
        self.score = [0, 0]
        self.players = []

    def get_player(self, channel_name):
        for player in self.players:
            if player.channel_name == channel_name:
                return player
        return None

    def add_player(self, player):
        self.players.append(player)

    def remove_player(self, channel_name):
        player = self.get_player(channel_name)
        self.players.remove(player)
