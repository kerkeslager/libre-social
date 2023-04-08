from django.contrib import admin
from . import models

class CircleAdmin(admin.ModelAdmin):
    pass

admin.site.register(models.Circle, CircleAdmin)
