from django.templatetags.static import static
from django.urls import reverse
from jinja2 import Environment

def environment(**options ):
    env = Environment(**options)
    
    def url_for(endpoint, **kwargs):
        """
        Jinja2 helper to reverse Django URLs.
        Usage: {{ url_for('view_name', arg=value) }}
        For static files: {{ url_for('static', filename='css/main.css') }}
        """
        if endpoint == 'static':
            filename = kwargs.get('filename', '')
            return static(filename)
        else:
            return reverse(endpoint, kwargs=kwargs) if kwargs else reverse(endpoint)
    
    env.globals.update({
        'static': static,
        'url_for': url_for,
        'reverse': reverse,
    })
    return env