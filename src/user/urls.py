from django.urls import path

from . import views

urlpatterns = [
    path('u/me', views.MeView.as_view(), name='me'),
    path('u/settings', views.SettingsView.as_view(), name='settings'),
    path('u/<uuid:pk>', views.ProfileView.as_view(), name='profile'),
    path('c/<uuid:pk>', views.CircleView.as_view(), name='circle'),
]
