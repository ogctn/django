# Generated by Django 4.2.17 on 2025-01-06 12:02

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_remove_customuser_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='game_requests',
            field=models.ManyToManyField(blank=True, related_name='games_requests', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='customuser',
            name='isActiveTwoFactor',
            field=models.BooleanField(default=False),
        ),
    ]
