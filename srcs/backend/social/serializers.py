from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Block, Follow, Friend
from users.models import CustomUser



class FollowSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='owner.username')
    target = serializers.CharField(source='target.username')


    class Meta:
        model = Follow
        fields = ['id', 'owner', 'target', 'created_at']



class FriendSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='owner.username')
    target = serializers.CharField(source='target.username')

    class Meta:
        model = Friend
        fields = ['id', 'owner', 'target', 'is_accepted', 'created_at']



class BlockSerializer(serializers.ModelSerializer):

    class Meta:
        model = Block
        fields = ['id', 'owner', 'target', 'created_at']

