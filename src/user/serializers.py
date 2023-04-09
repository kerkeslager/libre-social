from rest_framework import exceptions, serializers

from . import models

class CircleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Circle
        fields = (
            'name',
            'color',
        )

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Profile
        fields = (
            'name',
            'description',
            'is_current_user',
        )

    is_current_user = serializers.SerializerMethodField()

    def get_is_current_user(self, obj):
        return self.context['request'].user.profile == obj
