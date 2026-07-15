from django.test import TestCase

from ..models import Usuario
from ..serializer import LoginSerializer


class LoginSerializerTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe",
            password="pass1234",
            nombre="John Doe",
            email="john@test.com",
            rol="Administrador",
            activo=True,
        )

    def test_credenciales_validas(self):
        serializer = LoginSerializer(data={"username": "jdoe", "password": "pass1234"})
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["user"], self.usuario)

    def test_usuario_inexistente(self):
        serializer = LoginSerializer(data={"username": "no_existe", "password": "x"})
        self.assertFalse(serializer.is_valid())

    def test_password_incorrecta(self):
        serializer = LoginSerializer(data={"username": "jdoe", "password": "mala"})
        self.assertFalse(serializer.is_valid())

    def test_usuario_desactivado_no_puede_loguear(self):
        self.usuario.activo = False
        self.usuario.save()
        serializer = LoginSerializer(data={"username": "jdoe", "password": "pass1234"})
        self.assertFalse(serializer.is_valid())