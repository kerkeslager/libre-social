from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import models, serializers

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = models.Profile.objects.all()
    serializer_class = serializers.ProfileSerializer

profile_detail_view = ProfileViewSet.as_view({
    'get': 'retrieve',
    'post': 'partial_update',
})

@api_view(['DELETE'])
def delete_view(request):
    if request.user.check_password(request.data['password']):
        request.user.delete()
        return Response({'deleted': True})

    return Response({'deleted': False})
