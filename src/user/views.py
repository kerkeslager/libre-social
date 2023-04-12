import io

from django.shortcuts import redirect, render
from django.utils.safestring import mark_safe
from django.views import View
from django.views.generic.detail import DetailView

import pyqrcode

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

    def get_object(self):
        return self.request.user

class CircleView(DetailView):
    model = models.Circle
    template_name = 'user/circle.html'

    def get_object(self):
        return models.Circle.objects.get(pk=self.kwargs['pk'])

class InviteView(DetailView):
    model = models.Invite
    template_name = 'user/invite.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        url = pyqrcode.create(
            self.request.build_absolute_uri()
        )
        buffer = io.BytesIO()
        url.svg(buffer, omithw=True)
        qr_svg = buffer.getvalue().decode('utf-8')
        context['qr'] = mark_safe(qr_svg)
        return context

    def get_object(self):
        return models.Invite.objects.get(pk=self.kwargs['pk'])
