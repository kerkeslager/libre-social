from django.shortcuts import redirect, render
from django.views import View
from django.views.generic.detail import DetailView

from . import models

class MeView(DetailView):
    def get(self, request):
        if not request.user.is_authenticated:
            raise render('user/unauthorized.html', status=401)

        return redirect(
            'profile',
            pk=request.user.profile.id,
        )

class ProfileView(DetailView):
    model = models.Profile
    template_name = 'user/profile.html'

class SettingsView(DetailView):
    model = models.Profile
    template_name = 'user/settings.html'

    def get_object(self, queryset=None):
        return self.request.user

class CircleView(DetailView):
    model = models.Circle
    template_name = 'user/circle.html'

    def get_object(self, pk=None):
        return models.Circle.objects.get(pk=self.kwargs['pk'])
