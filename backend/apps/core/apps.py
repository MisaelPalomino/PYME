from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'
class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.authentication'