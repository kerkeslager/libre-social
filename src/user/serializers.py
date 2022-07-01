from rest_framework import exceptions, serializers

from . import models

class CircleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Circle
        fields = (
            'name',
            'color',
        )

class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Connection
        fields = (
            'circle',
        )

    circle = CircleSerializer()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Profile
        fields = (
            'name',
            'description',
            'is_current_user',
            'connections',
        )

    is_current_user = serializers.SerializerMethodField()
    connections = serializers.SerializerMethodField()

    def get_is_current_user(self, obj):
        return self.context['request'].user.profile == obj

    def get_connections(self, obj):
        connections = obj.user.reversed_connections.filter(
            circle__owner=self.context['request'].user
        )
        return [
            ConnectionSerializer(c).data['circle'] for c in connections
        ]
