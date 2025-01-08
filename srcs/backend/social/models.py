from django.db import models

# Create your models here.
from users.models import CustomUser

from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('cancelled', 'Cancelled'),
]

class FriendRequest(models.Model):
    sender = models.ForeignKey(CustomUser, related_name="sent_requests", on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser, related_name="received_requests", on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    message = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('sender', 'receiver')
    
    def clean(self):
        if self.sender == self.receiver:
            raise ValidationError("Invalid request: sender=receiver")
        if Block.objects.filter(blocker=self.sender, blocked=self.receiver).exists():
            raise ValidationError("User is already blocked.")
        if Block.objects.filter(blocker=self.receiver, blocked=self.sender).exists():
            raise ValidationError("You are blocked by the user.")
        
    def __str__(self):
        return f"request from '{self.sender}' to '{self.receiver}' ({self.get_status_display()})"


class Block(models.Model):
    blocker = models.ForeignKey(CustomUser, related_name="blocking", on_delete=models.CASCADE)
    blocked = models.ForeignKey(CustomUser, related_name="blocked_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')
    
    def clean(self):
        if self.blocker == self.blocked:
            raise ValidationError("Invalid request: sender=receiver")
        
    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"


class Follow(models.Model):
    follower = models.ForeignKey(CustomUser, related_name="following_set", on_delete=models.CASCADE)
    followed = models.ForeignKey(CustomUser, related_name="followed_set", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')

    def __str__(self):
        return f"{self.follower} follows {self.followed}"


@receiver(post_save, sender=Block)
def handle_block(sender, instance, created, **kwargs):
    if created:
        blocker = instance.blocker
        blocked = instance.blocked

        if blocker.following.filter(pk=blocked.pk).exists():
            blocker.following.remove(blocked)
        if blocked.following.filter(pk=blocker.pk).exists():
            blocked.following.remove(blocker)
        
        if blocker.friends.filter(pk=blocked.pk).exists():
            blocker.friends.remove(blocked)
            blocked.friends.remove(blocker)


@receiver(pre_delete, sender=Block)
def handle_unblock(sender, instance, **kwargs):
    blocker = instance.blocker
    blocked = instance.blocked

    if not Block.objects.filter(blocker=blocker, blocked=blocked).exists():
        raise ValidationError(f"{blocked} is not blocked by {blocker}")

    if blocker.following.filter(pk=blocked.pk).exists():
        blocker.following.remove(blocked)
    if blocked.following.filter(pk=blocker.pk).exists():
        blocked.following.remove(blocker)

    if blocker.friends.filter(pk=blocked.pk).exists():
        blocker.friends.remove(blocked)
        blocked.friends.remove(blocker)


@receiver(post_save, sender=Follow)
def handle_follow(sender, instance, created, **kwargs):
    if created:
        follower = instance.follower
        followed = instance.followed

        if Block.objects.filter(blocker=followed, blocked=follower).exists():
            follower.following.remove(followed)
            followed.followers.remove(follower)
            raise ValidationError(f"{followed} has blocked {follower}. Cannot follow.")
            
        if Block.objects.filter(blocker=follower, blocked=followed).exists():
            follower.following.remove(followed)
            followed.followers.remove(follower)
            raise ValidationError(f"{follower} has blocked {followed}. Cannot follow.")


@receiver(post_save, sender=FriendRequest)
def handle_friend_request(sender, instance, created, **kwargs):
    sender_user = instance.sender
    receiver_user = instance.receiver

    if Block.objects.filter(blocker=sender_user, blocked=receiver_user).exists():
        instance.delete()
        raise ValidationError(f"{receiver_user} has blocked you. Cannot send friend request.")

    if Block.objects.filter(blocker=receiver_user, blocked=sender_user).exists():
        instance.delete()
        raise ValidationError(f"You have blocked {receiver_user}. Cannot send friend request.")

    if sender_user.friends.filter(pk=receiver_user.pk).exists():
        instance.delete()
        raise ValidationError(f"{sender_user} and {receiver_user} are already friends.")
    
