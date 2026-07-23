from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from apps.authentication.models import Usuario


class Command(BaseCommand):
    help = "Hashea todas las contraseñas de usuarios que no estén hasheadas."

    def handle(self, *args, **options):
        updated = 0
        for usuario in Usuario.objects.all():
            password = usuario.password
            if password and not password.startswith(("pbkdf2_", "argon2$", "scrypt$")):
                usuario.password = make_password(password)
                usuario.save(update_fields=["password"])
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"Contraseñas hasheadas: {updated}"))
