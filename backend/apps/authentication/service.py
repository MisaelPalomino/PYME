from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario

class AuthService:
    @staticmethod
    def login(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': {
                'id_usuario': user.id_usuario,
                'username': user.username,
                'nombre': user.nombre,
                'email': user.email,
                'rol': user.rol,
            }
        }

    @staticmethod
    def logout(refresh_token: str):
        """Invalida (blacklist) el refresh token."""
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Token inválido o ya expirado.")


class UsuarioService:

    @staticmethod
    def listar():
        return Usuario.objects.all().order_by('id_usuario')

    @staticmethod
    def obtener(pk):
        return get_object_or_404(Usuario, pk=pk)

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def actualizar(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def desactivar(usuario):
        """Desactiva la cuenta sin eliminarla."""
        usuario.activo = False
        usuario.save(update_fields=['activo'])

    @staticmethod
    @transaction.atomic
    def cambiar_password(usuario, serializer_data):
        password_actual = serializer_data['password_actual']
        if usuario.password != password_actual:
            raise serializers.ValidationError(
                {"password_actual": "La contraseña actual es incorrecta."}
            )
        usuario.password = serializer_data['password_nuevo']
        usuario.save(update_fields=['password'])