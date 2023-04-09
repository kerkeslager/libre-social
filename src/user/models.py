import uuid

from django.contrib.auth.models import User
from django.db import models
from django.db.models import signals
from django.dispatch import receiver
from django.urls import reverse

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

@receiver(signals.post_save, sender=User)
def create_circles(sender, instance, created, **kwargs):
    if created:
        Circle.objects.create(
            owner=instance,
            name='Family',
            color='0000bb',
        )
        Circle.objects.create(
            owner=instance,
            name='Friends',
            color='bb0000',
        )

class Circle(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False,
    )
    name = models.CharField(max_length = 256)
    color = models.CharField(max_length = 6)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='circles',
    )

    def __str__(self):
        return "{}'s {} Circle".format(
            self.owner.username,
            self.name,
        )

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('circle', kwargs={'pk' : self.pk})
