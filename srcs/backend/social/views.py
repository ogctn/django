from django.shortcuts import render

# Create your views here.
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import FriendRequest, Follow, Block
from users.models import CustomUser
from .serializers import FriendRequestSerializer, FollowSerializer
from django.core.exceptions import ValidationError

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_user(request):
    follower = request.user
    followed_id = request.data.get('followed')

    if not followed_id:
        return Response({"detail": "Followed user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    followed = CustomUser.objects.get(id=followed_id)

    if Block.objects.filter(blocker=follower, blocked=followed).exists():
        return Response({"detail": f"You have blocked {followed.username}. Cannot follow."}, status=status.HTTP_400_BAD_REQUEST)
    if Block.objects.filter(blocker=followed, blocked=follower).exists():
        return Response({"detail": f"{followed.username} has blocked you. Cannot follow."}, status=status.HTTP_400_BAD_REQUEST)

    follow, created = Follow.objects.get_or_create(follower=follower, followed=followed)
    if not created:
        return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"detail": "Successfully followed the user."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_friend_request(request):
    sender = request.user
    receiver_id = request.data.get('receiver')

    if not receiver_id:
        return Response({"detail": "Receiver user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    receiver = CustomUser.objects.get(id=receiver_id)

    if Block.objects.filter(blocker=sender, blocked=receiver).exists():
        return Response({"detail": f"You have blocked {receiver.username}. Cannot send friend request."}, status=status.HTTP_400_BAD_REQUEST)
    if Block.objects.filter(blocker=receiver, blocked=sender).exists():
        return Response({"detail": f"{receiver.username} has blocked you. Cannot send friend request."}, status=status.HTTP_400_BAD_REQUEST)

    friend_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver)
    if not created:
        return Response({"detail": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"detail": "Friend request sent."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def block_user(request):
    blocker = request.user
    blocked_id = request.data.get('blocked')

    if not blocked_id:
        return Response({"detail": "Blocked user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    blocked = CustomUser.objects.get(id=blocked_id)

    if Block.objects.filter(blocker=blocker, blocked=blocked).exists():
        return Response({"detail": f"You have already blocked {blocked.username}."}, status=status.HTTP_400_BAD_REQUEST)

    block = Block.objects.create(blocker=blocker, blocked=blocked)

    if blocker.following.filter(pk=blocked.pk).exists():
        blocker.following.remove(blocked)
    if blocked.following.filter(pk=blocker.pk).exists():
        blocked.following.remove(blocker)

    if blocker.friends.filter(pk=blocked.pk).exists():
        blocker.friends.remove(blocked)
    if blocked.friends.filter(pk=blocker.pk).exists():
        blocked.friends.remove(blocker)

    return Response({"detail": f"{blocked.username} has been blocked."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unblock_user(request):
    blocker = request.user
    blocked_id = request.data.get('blocked')

    if not blocked_id:
        return Response({"detail": "Blocked user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    blocked = CustomUser.objects.get(id=blocked_id)

    block = Block.objects.filter(blocker=blocker, blocked=blocked).first()
    if not block:
        return Response({"detail": f"{blocked.username} is not blocked by you."}, status=status.HTTP_400_BAD_REQUEST)

    block.delete()
    return Response({"detail": f"{blocked.username} has been unblocked."}, status=status.HTTP_200_OK)


@login_required
def test_page(request):
    return render(request, 'social/test.html', {'user': request.user})
