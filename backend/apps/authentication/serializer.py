from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario

ROLES_VALIDOS = ['Administrador', 'Gerente', 'Almacenero', 'Comprador']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = Usuario.objects.get(username=attrs['username'])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas.")

        if user.password != attrs['password']:
            raise serializers.ValidationError("Credenciales inválidas.")

        if not user.activo:
            raise serializers.ValidationError("La cuenta está desactivada.")

        attrs['user'] = user
        return attrs


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, label="Confirmar contraseña")

    class Meta:
        model = Usuario
        fields = (
            'id_usuario',
            'username',
            'email',
            'nombre',
            'rol',
            'password',
            'password2',
        )
        read_only_fields = ('id_usuario',)

    def validate_rol(self, value):
        if value not in ROLES_VALIDOS:
            raise serializers.ValidationError(
                f"Rol inválido. Opciones válidas: {', '.join(ROLES_VALIDOS)}"
            )
        return value

    def validate_username(self, value):
        if Usuario.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese nombre de usuario.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.password = password
        user.save()
        return user


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = (
            'id_usuario',
            'username',
            'email',
            'nombre',
            'rol',
            'activo',
            'fecha_creacion',
        )
        read_only_fields = ('id_usuario', 'fecha_creacion')

    def validate_rol(self, value):
        if value not in ROLES_VALIDOS:
            raise serializers.ValidationError(
                f"Rol inválido. Opciones válidas: {', '.join(ROLES_VALIDOS)}"
            )
        return value


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True)
    password_nuevo2 = serializers.CharField(write_only=True, label="Confirmar nueva contraseña")

    def validate(self, attrs):
        if attrs['password_nuevo'] != attrs['password_nuevo2']:
            raise serializers.ValidationError({"password_nuevo2": "Las contraseñas no coinciden."})
        return attrs