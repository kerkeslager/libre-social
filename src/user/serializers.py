import commonmark
from rest_framework import exceptions, serializers

from . import models

class MarkdownField(serializers.CharField):
    def to_representation(self, obj):
        request = self.context['request']

        if request.method.lower() == 'get':
            render_markdown = request.GET.get('render_markdown', 'true')

            if render_markdown == 'true':
                render_markdown = True
            elif render_markdown == 'false':
                render_markdown = False
            else:
                raise exceptions.ValidationError(
                    'Invalid value "{}" for parameter "render_markdown"'.format(
                        render_markdown,
                    ),
                )

        result = super().to_representation(obj)

        if render_markdown:
            return commonmark.commonmark(result)

        return result

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = (
            'name',
            'description',
            'is_current_user',
        )
    description = MarkdownField()
    is_current_user = serializers.SerializerMethodField()

    def get_is_current_user(self, obj):
        return self.context['request'].user == obj
