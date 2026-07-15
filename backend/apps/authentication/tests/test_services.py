from django.http import Http404
from django.test import TestCase
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Usuario
from ..serializer import RegistroUsuarioSerializer, UsuarioSerializer
from ..service import AuthService, UsuarioService


class AuthServiceTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe",
            password="pass1234",
            nombre="John Doe",
            email="john@test.com",
            rol="Administrador",
            activo=True,
        )

    def test_login_devuelve_access_y_refresh(self):
        data = AuthService.login(self.usuario)
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertIsInstance(data["access"], str)
        self.assertIsInstance(data["refresh"], str)

    def test_login_devuelve_datos_correctos_del_usuario(self):
        data = AuthService.login(self.usuario)
        self.assertEqual(data["usuario"]["id_usuario"], self.usuario.id_usuario)
        self.assertEqual(data["usuario"]["username"], "jdoe")
        self.assertEqual(data["usuario"]["rol"], "Administrador")

    def test_logout_invalida_un_refresh_token_valido(self):
        refresh = RefreshToken.for_user(self.usuario)
        # No debe lanzar excepción: el token queda en blacklist.
        AuthService.logout(str(refresh))

    def test_logout_con_token_invalido_lanza_validation_error(self):
        with self.assertRaises(serializers.ValidationError):
            AuthService.logout("esto-no-es-un-token-valido")


class UsuarioServiceTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe",
            password="pass1234",
            nombre="John Doe",
            email="john@test.com",
            rol="Administrador",
            activo=True,
        )

    def test_listar_ordenado_por_id_usuario(self):
        Usuario.objects.create(
            username="asmith", password="x", nombre="Alice Smith",
            email="a@test.com", rol="Gerente", activo=True,
        )
        usuarios = list(UsuarioService.listar())
        self.assertEqual(usuarios[0].id_usuario, self.usuario.id_usuario)
        self.assertEqual(len(usuarios), 2)

    def test_obtener_existente(self):
        obtenido = UsuarioService.obtener(self.usuario.pk)
        self.assertEqual(obtenido.pk, self.usuario.pk)

    def test_obtener_inexistente_lanza_404(self):
        with self.assertRaises(Http404):
            UsuarioService.obtener(9999)

    def test_crear(self):
        serializer = RegistroUsuarioSerializer(data={
            "username": "nuevo",
            "email": "nuevo@test.com",
            "nombre": "Nuevo Usuario",
            "rol": "Comprador",
            "password": "clave123",
            "password2": "clave123",
        })
        serializer.is_valid(raise_exception=True)
        usuario = UsuarioService.crear(serializer)
        self.assertEqual(Usuario.objects.count(), 2)
        self.assertEqual(usuario.username, "nuevo")

    def test_actualizar(self):
        serializer = UsuarioSerializer(self.usuario, data={
            "username": "jdoe",
            "email": "john@test.com",
            "nombre": "John D. Actualizado",
            "rol": "Gerente",
            "activo": True,
        })
        serializer.is_valid(raise_exception=True)
        actualizado = UsuarioService.actualizar(serializer)
        self.assertEqual(actualizado.nombre, "John D. Actualizado")
        self.assertEqual(actualizado.rol, "Gerente")

    def test_desactivar_no_elimina_el_registro(self):
        UsuarioService.desactivar(self.usuario)
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.activo)
        self.assertEqual(Usuario.objects.count(), 1)

    def test_cambiar_password_con_actual_correcta(self):
        UsuarioService.cambiar_password(self.usuario, {
            "password_actual": "pass1234",
            "password_nuevo": "nueva456",
        })
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.password, "nueva456")

    def test_cambiar_password_con_actual_incorrecta_lanza_error(self):
        with self.assertRaises(serializers.ValidationError):
            UsuarioService.cambiar_password(self.usuario, {
                "password_actual": "password-equivocada",
                "password_nuevo": "nueva456",
            })