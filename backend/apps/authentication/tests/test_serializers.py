from django.test import TestCase

from ..models import Usuario
from ..serializer import (
    CambiarPasswordSerializer,
    LoginSerializer,
    RegistroUsuarioSerializer,
    UsuarioSerializer,
)


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

class RegistroUsuarioSerializerTest(TestCase):
    def _datos_validos(self, **overrides):
        datos = {
            "username": "nuevo",
            "email": "nuevo@test.com",
            "nombre": "Nuevo Usuario",
            "rol": "Almacenero",
            "password": "clave123",
            "password2": "clave123",
        }
        datos.update(overrides)
        return datos

    def test_datos_validos(self):
        serializer = RegistroUsuarioSerializer(data=self._datos_validos())
        self.assertTrue(serializer.is_valid())

    def test_passwords_no_coinciden(self):
        serializer = RegistroUsuarioSerializer(data=self._datos_validos(password2="otra"))
        self.assertFalse(serializer.is_valid())
        self.assertIn("password2", serializer.errors)

    def test_rol_invalido(self):
        serializer = RegistroUsuarioSerializer(data=self._datos_validos(rol="SuperAdmin"))
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)

    def test_username_duplicado(self):
        Usuario.objects.create(
            username="nuevo", password="x", nombre="Y",
            email="y@test.com", rol="Gerente", activo=True,
        )
        serializer = RegistroUsuarioSerializer(data=self._datos_validos())
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_create_guarda_password_en_texto_plano(self):
        serializer = RegistroUsuarioSerializer(data=self._datos_validos())
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        self.assertEqual(usuario.password, "clave123")

class UsuarioSerializerTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe", password="x", nombre="John",
            email="j@test.com", rol="Administrador", activo=True,
        )

    def test_rol_invalido_en_edicion(self):
        serializer = UsuarioSerializer(self.usuario, data={
            "username": "jdoe",
            "email": "j@test.com",
            "nombre": "John",
            "rol": "Inventado",
            "activo": True,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)

    def test_no_expone_el_password(self):
        serializer = UsuarioSerializer(self.usuario)
        self.assertNotIn("password", serializer.data)


class CambiarPasswordSerializerTest(TestCase):
    def test_confirmacion_no_coincide(self):
        serializer = CambiarPasswordSerializer(data={
            "password_actual": "actual",
            "password_nuevo": "nueva1",
            "password_nuevo2": "nueva2",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("password_nuevo2", serializer.errors)

    def test_datos_validos(self):
        serializer = CambiarPasswordSerializer(data={
            "password_actual": "actual",
            "password_nuevo": "nueva1",
            "password_nuevo2": "nueva1",
        })
        self.assertTrue(serializer.is_valid())