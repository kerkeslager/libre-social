from rest_framework import viewsets

from . import models, serializers

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = models.Profile.objects.all()
    serializer_class = serializers.ProfileSerializer

profile_detail_view = ProfileViewSet.as_view({
    'get': 'retrieve',
    'post': 'partial_update',
})
