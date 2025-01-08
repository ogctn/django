from rest_framework import serializers

from users.models import CustomUser
from .models import Block, FriendRequest, Follow

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    receiver = serializers.StringRelatedField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'status', 'created_at', 'updated_at', 'message']

    def validate(self, data):
        if data['sender'] == data['receiver']:
            raise serializers.ValidationError("Sender cannot be the same as receiver.")
        return data

class BlockSerializer(serializers.ModelSerializer):
    blocker = serializers.StringRelatedField()
    blocked = serializers.StringRelatedField()

    class Meta:
        model = Block
        fields = ['id', 'blocker', 'blocked', 'created_at']

    def validate(self, data):
        if data['blocker'] == data['blocked']:
            raise serializers.ValidationError("You cannot block yourself.")
        return data
    
class FollowSerializer(serializers.ModelSerializer):
    follower = serializers.StringRelatedField()
    followed = serializers.StringRelatedField()

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'followed', 'created_at']

    def validate(self, data):
        if Block.objects.filter(blocker=data['followed'], blocked=data['follower']).exists():
            raise serializers.ValidationError(f"{data['followed']} has blocked {data['follower']}. Cannot follow.")
        if Block.objects.filter(blocker=data['follower'], blocked=data['followed']).exists():
            raise serializers.ValidationError(f"{data['follower']} has blocked {data['followed']}. Cannot follow.")
        return data
