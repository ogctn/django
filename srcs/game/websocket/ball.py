import time

class Ball:
    def __init__(self, position):
        self.previous_time = time.time()
        self.position = position
        self.velocityX = 200
        self.velocityY = 200
        self.radius =  10
        self.game_width = 1200
        self.game_height = 600

    def update_ball(self):
        self.current_time = time.time()
        self.delta_time = self.current_time - self.previous_time
        self.previous_time = self.current_time
        self.position[0] += self.velocityY * self.delta_time
        self.position[1] += self.velocityX * self.delta_time

    def reset_ball(self):
        self.position[1] = int(self.game_width / 2)
        self.position[0] = int(self.game_height / 2)
        self.velocityX = 200
        self.velocityY = 200

    def check_collision(self):
        if (self.position[0] + self.radius > self.game_height or
            self.position[0] - self.radius <= 0):
            self.velocityY *= -1

    def check_goal(self, players):
        paddle_left = 250
        paddle_right = 250
        if len(players) == 1:
            paddle_left = players[0].paddle.position[1]
            paddle_right = 250
        elif len(players) == 2:
            paddle_left = players[1].paddle.position[1]
            paddle_right = players[0].paddle.position[1]
        if self.position[1] + self.radius > self.game_width:
            if self.position[0] < paddle_right or self.position[0] > paddle_right + players[1].paddle.paddle_height:
                    return 0
            else: 
                self.velocityX *= -1
        if self.position[1] - self.radius < 0:
            if self.position[0] < paddle_left or self.position[0] > paddle_left + players[1].paddle.paddle_height:
                    return 1
            else: 
                self.velocityX *= -1
        return -1


