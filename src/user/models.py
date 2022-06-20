import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False,
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
