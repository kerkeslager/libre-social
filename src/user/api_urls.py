from django.urls import path

from . import api_views as views

app_name = 'api'

urlpatterns = [
    path('user/<uuid:pk>', views.profile_detail_view, name='profile'),
    path('user/me/delete', views.delete_view, name='delete-user'),
    path('circle/<uuid:pk>', views.circle_view, name='circle'),
    path('invite/<uuid:pk>', views.invite_detail_view, name='invite-detail'),
    path('invite', views.invite_list_view, name='invite-list'),
]
