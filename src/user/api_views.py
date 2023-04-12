from datetime import datetime, timezone

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

class CircleViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CircleSerializer

    def get_queryset(self):
        return self.request.user.circles.all()

    def get_object(self):
        return self.get_queryset().get(pk=self.kwargs['pk'])

circle_view = CircleViewSet.as_view({
    'get': 'retrieve',
    'post': 'partial_update',
    'delete': 'destroy',
})

# TODO Limit viewing the list and editing to the owner
class InviteViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.InviteSerializer

    def get_queryset(self):
        return self.request.user.invites.all()

    def get_object(self):
        return models.Invite.objects.get(
            pk=self.kwargs['pk'],
        )

    def perform_create(self, serializer):
        # TODO Validate that the circle is owned by the owner
        serializer.save(
            owner=self.request.user,
            expiration_utc=datetime.now(timezone.utc) + timedelta(days=7),
        )

invite_detail_view = InviteViewSet.as_view({
    'get': 'retrieve',
    'post': 'partial_update',
    'delete': 'destroy',
})
invite_list_view = InviteViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
