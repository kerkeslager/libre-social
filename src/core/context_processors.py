from django.conf import settings

def debug_context_processor(request):
    print( 'settings.DEBUG', settings.DEBUG )
    return {
        'DEBUG': settings.DEBUG
    }
