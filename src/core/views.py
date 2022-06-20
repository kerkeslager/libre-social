from django.views.generic.base import TemplateView

class IndexView(TemplateView):
    template_name = 'core/index.html'

class DonateView(TemplateView):
    template_name = 'core/donate.html'
