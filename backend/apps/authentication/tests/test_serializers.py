from django.test import TestCase
from apps.authentication.models import Usuario
from apps.authentication.serializer import (
    CambiarPasswordSerializer,
    LoginSerializer,
    RegistroUsuarioSerializer,
    UsuarioSerializer,
)


class LoginSerializerTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test",
            email="test@test.com",
            rol="Gerente",
            password="pass123",
        )

    def test_login_valido(self):
        serializer = LoginSerializer(
            data={"username": "testuser", "password": "pass123"}
        )
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["user"], self.usuario)

    def test_usuario_inexistente(self):
        serializer = LoginSerializer(
            data={"username": "noexiste", "password": "pass123"}
        )
        self.assertFalse(serializer.is_valid())

    def test_contrasena_incorrecta(self):
        serializer = LoginSerializer(
            data={"username": "testuser", "password": "wrong"}
        )
        self.assertFalse(serializer.is_valid())

    def test_usuario_desactivado(self):
        self.usuario.activo = False
        self.usuario.save()
        serializer = LoginSerializer(
            data={"username": "testuser", "password": "pass123"}
        )
        self.assertFalse(serializer.is_valid())


class RegistroUsuarioSerializerTest(TestCase):
    def test_registro_valido(self):
        serializer = RegistroUsuarioSerializer(
            data={
                "username": "newuser",
                "email": "new@test.com",
                "nombre": "New User",
                "rol": "Almacenero",
                "password": "pass123",
                "password2": "pass123",
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_contrasenas_no_coinciden(self):
        serializer = RegistroUsuarioSerializer(
            data={
                "username": "newuser",
                "email": "new@test.com",
                "nombre": "New User",
                "rol": "Almacenero",
                "password": "pass123",
                "password2": "different",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("password2", serializer.errors)

    def test_rol_invalido(self):
        serializer = RegistroUsuarioSerializer(
            data={
                "username": "newuser",
                "email": "new@test.com",
                "nombre": "New User",
                "rol": "InvalidRole",
                "password": "pass123",
                "password2": "pass123",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)

    def test_username_duplicado(self):
        Usuario.objects.create(
            username="existing",
            nombre="Existing",
            email="exists@test.com",
            rol="Gerente",
            password="pass123",
        )
        serializer = RegistroUsuarioSerializer(
            data={
                "username": "existing",
                "email": "new@test.com",
                "nombre": "New",
                "rol": "Gerente",
                "password": "pass123",
                "password2": "pass123",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)


class UsuarioSerializerTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test",
            email="test@test.com",
            rol="Gerente",
            password="pass123",
        )

    def test_serializer_campos(self):
        serializer = UsuarioSerializer(self.usuario)
        data = serializer.data
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["nombre"], "Test")
        self.assertEqual(data["email"], "test@test.com")
        self.assertEqual(data["rol"], "Gerente")

    def test_rol_invalido(self):
        serializer = UsuarioSerializer(
            self.usuario, data={"rol": "InvalidRole"}, partial=True
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)


class CambiarPasswordSerializerTest(TestCase):
    def test_contrasenas_coinciden(self):
        serializer = CambiarPasswordSerializer(
            data={
                "password_actual": "old",
                "password_nuevo": "new123",
                "password_nuevo2": "new123",
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_contrasenas_no_coinciden(self):
        serializer = CambiarPasswordSerializer(
            data={
                "password_actual": "old",
                "password_nuevo": "new123",
                "password_nuevo2": "different",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("password_nuevo2", serializer.errors)
