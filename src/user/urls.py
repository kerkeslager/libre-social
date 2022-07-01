from django.urls import path

from . import views

urlpatterns = [
    path('me', views.MeView.as_view(), name='me'),
    path('settings', views.SettingsView.as_view(), name='settings'),
    path('<uuid:pk>', views.ProfileView.as_view(), name='profile'),
]
