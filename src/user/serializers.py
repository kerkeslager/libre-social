from rest_framework import exceptions, serializers

from . import models

class CircleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Circle
        fields = (
            'id',
            'name',
            'color',
        )

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Profile
        fields = (
            'id',
            'name',
            'description',
            'is_current_user',
        )

    is_current_user = serializers.SerializerMethodField()

    def get_is_current_user(self, obj):
        return self.context['request'].user.profile == obj

class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Invite
        fields = (
            'id',
            'owner_name',
            'circle', # TODO Only expose this to the owner
            'message',
            'is_expired',
            'is_single_use',
        )
