from rest_framework import exceptions, serializers

from . import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = (
            'name',
            'description',
            'is_current_user',
        )

    is_current_user = serializers.SerializerMethodField()

    def get_is_current_user(self, obj):
        return self.context['request'].user == obj
