import uuid

from django.contrib.auth.models import User
from django.db import models
from django.db.models import signals
from django.dispatch import receiver

class Profile(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False,
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    name = models.CharField(
        blank = True,
        max_length = 256,
        null = True,
    )
    description = models.CharField(
        blank = True,
        max_length = 4096,
        null = True,
    )

@receiver(signals.post_save, sender=User)
def save_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
