"""
Pruebas funcionales: Flujo completo de autenticación.
Tests: login → obtener usuario → logout → verificar sesión cerrada.
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import Usuario


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class AuthFlowFunctionalTest(TestCase):
    """Flujo funcional completo de autenticación."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test User",
            email="test@test.com",
            rol="Gerente",
            password="pass123",
        )

    def test_login_obtener_usuario_logout(self):
        # 1. Login
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data["access"]
        refresh_token = response.data["refresh"]
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["usuario"]["username"], "testuser")

        # 2. Obtener información del usuario autenticado
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(f"/api/auth/usuarios/{self.usuario.id_usuario}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["rol"], "Gerente")

        # 3. Logout
        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Verificar que el refresh token ya no funciona
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_registro_login_perfil(self):
        # 1. Login como admin para poder registrar
        admin = Usuario.objects.create(
            username="admin", nombre="Admin", email="admin@test.com",
            rol="Administrador", password="admin123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "admin123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

        # 2. Registrar nuevo usuario
        response = self.client.post(
            "/api/auth/usuarios/",
            {
                "username": "newuser",
                "email": "new@test.com",
                "nombre": "New User",
                "rol": "Almacenero",
                "password": "newpass123",
                "password2": "newpass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_id = response.data["id_usuario"]

        # 3. Login con el nuevo usuario
        response = self.client.post(
            "/api/auth/login/",
            {"username": "newuser", "password": "newpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data["access"]

        # 4. Ver perfil
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(f"/api/auth/usuarios/{user_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "New User")

    def test_cambiar_password_relogin(self):
        # 1. Login
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # 2. Cambiar contraseña
        response = self.client.post(
            f"/api/auth/usuarios/{self.usuario.id_usuario}/cambiar_password/",
            {
                "password_actual": "pass123",
                "password_nuevo": "newpass456",
                "password_nuevo2": "newpass456",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Login con contraseña antigua debe fallar
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Login con contraseña nueva debe funcionar
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "newpass456"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_desactivar_usuario_login_falla(self):
        # 1. Login exitoso
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data["access"]

        # 2. Desactivar usuario (como admin)
        admin = Usuario.objects.create(
            username="admin", nombre="Admin", email="admin@test.com",
            rol="Administrador", password="admin123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "admin123"},
            format="json",
        )
        admin_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")
        response = self.client.delete(
            f"/api/auth/usuarios/{self.usuario.id_usuario}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Login con usuario desactivado debe fallar
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
