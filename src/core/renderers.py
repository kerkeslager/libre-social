from rest_framework import renderers

class CamelCaseJSONRenderer(renderers.JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, dict):
            data = {
                ''.join(
                    word if index == 0 else word.capitalize()
                    for index, word
                    in enumerate(key.split('_'))
                ): value
                for key, value
                in data.items()
            }

        return super().render(data, accepted_media_type, renderer_context)
