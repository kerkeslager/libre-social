from django.urls import path

from . import api_views as views

app_name = 'api'

urlpatterns = [
    path('user/<uuid:pk>', views.profile_detail_view, name='profile'),
    path('user/me/delete', views.delete_view, name='delete-user'),
    path('circle/<uuid:pk>', views.circle_view, name='circle'),
]
