from django.contrib.auth.hashers import make_password
from django.test import TestCase
from apps.authentication.models import Usuario


class UsuarioModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test User",
            email="test@test.com",
            rol="Gerente",
            password=make_password("pass123"),
        )

    def test_str(self):
        self.assertEqual(str(self.usuario), "testuser")

    def test_id_property(self):
        self.assertEqual(self.usuario.id, self.usuario.id_usuario)

    def test_is_active_property(self):
        self.assertTrue(self.usuario.is_active)

    def test_is_active_setter(self):
        self.usuario.is_active = False
        self.assertFalse(self.usuario.activo)

    def test_activo_default(self):
        self.assertTrue(self.usuario.activo)

    def test_email_unique(self):
        with self.assertRaises(Exception):
            Usuario.objects.create(
                username="other",
                nombre="Other",
                email="test@test.com",
                rol="Almacenero",
                password=make_password("pass456"),
            )
