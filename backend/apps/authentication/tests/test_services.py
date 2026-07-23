from django.contrib.auth.hashers import check_password, make_password
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from apps.authentication.models import Usuario
from apps.authentication.service import AuthService, UsuarioService


class AuthServiceTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test User",
            email="test@test.com",
            rol="Gerente",
            password=make_password("pass123"),
        )

    def test_login(self):
        result = AuthService.login(self.usuario)
        self.assertIn("access", result)
        self.assertIn("refresh", result)
        self.assertEqual(result["usuario"]["username"], "testuser")
        self.assertEqual(result["usuario"]["rol"], "Gerente")

    def test_logout(self):
        result = AuthService.login(self.usuario)
        AuthService.logout(result["refresh"])

    def test_logout_token_invalido(self):
        with self.assertRaises(serializers.ValidationError):
            AuthService.logout("invalid_token")


class UsuarioServiceTest(TestCase):
    def setUp(self):
        self.usuario1 = Usuario.objects.create(
            username="user1",
            nombre="User 1",
            email="user1@test.com",
            rol="Gerente",
            password=make_password("pass123"),
        )
        self.usuario2 = Usuario.objects.create(
            username="user2",
            nombre="User 2",
            email="user2@test.com",
            rol="Almacenero",
            password=make_password("pass456"),
        )

    def test_listar(self):
        usuarios = UsuarioService.listar()
        self.assertEqual(usuarios.count(), 2)

    def test_obtener(self):
        usuario = UsuarioService.obtener(self.usuario1.id_usuario)
        self.assertEqual(usuario.username, "user1")

    def test_obtener_inexistente(self):
        from django.http import Http404
        with self.assertRaises(Http404):
            UsuarioService.obtener(9999)

    def test_crear(self):
        class FakeSerializer:
            def save(self):
                return Usuario.objects.create(
                    username="newuser",
                    nombre="New",
                    email="new@test.com",
                    rol="Comprador",
                    password=make_password("newpass"),
                )

        usuario = UsuarioService.crear(FakeSerializer())
        self.assertEqual(Usuario.objects.count(), 3)
        self.assertEqual(usuario.username, "newuser")

    def test_actualizar(self):
        class FakeSerializer:
            def save(self):
                self.instance.nombre = "Updated"
                self.instance.save()
                return self.instance

        serializer = FakeSerializer()
        serializer.instance = self.usuario1
        UsuarioService.actualizar(serializer)
        self.usuario1.refresh_from_db()
        self.assertEqual(self.usuario1.nombre, "Updated")

    def test_desactivar(self):
        UsuarioService.desactivar(self.usuario1)
        self.usuario1.refresh_from_db()
        self.assertFalse(self.usuario1.activo)

    def test_cambiar_password(self):
        UsuarioService.cambiar_password(
            self.usuario1,
            {
                "password_actual": "pass123",
                "password_nuevo": "newpass",
                "password_nuevo2": "newpass",
            },
        )
        self.usuario1.refresh_from_db()
        self.assertTrue(check_password("newpass", self.usuario1.password))

    def test_cambiar_password_incorrecta(self):
        with self.assertRaises(serializers.ValidationError):
            UsuarioService.cambiar_password(
                self.usuario1,
                {
                    "password_actual": "wrongpass",
                    "password_nuevo": "newpass",
                    "password_nuevo2": "newpass",
                },
            )
