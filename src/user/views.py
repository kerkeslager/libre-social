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
            pk=request.user.id,
        )

class ProfileView(DetailView):
    model = models.User
    template_name = 'user/profile.html'

