from django.urls import path

from . import api_views as views

app_name = 'api'

urlpatterns = [
    path('<uuid:pk>', views.profile_detail_view, name='user'),
]
