from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser
#from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from social.serializers import FriendRequestSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    friends = serializers.PrimaryKeyRelatedField(many=True, queryset=CustomUser.objects.all(),required=False)
    following = serializers.PrimaryKeyRelatedField(many=True, queryset=CustomUser.objects.all(),required=False)
    friend_requests = FriendRequestSerializer(many=True, required=False)
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'friends', 'following', 
            'friend_requests', 'played_games', 'game_rank', 'isActiveTwoFactor',
            'secret_key', 'qr_code'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        try:
            validate_password(value)  # Django'nun şifre doğrulama fonksiyonunu kullan
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        user.generate_secret_key()
        return user
