from django.contrib.auth.hashers import make_password
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import Usuario
from apps.authentication.serializer import RegistroUsuarioSerializer


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class LoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test",
            email="test@test.com",
            rol="Gerente",
            password=make_password("pass123"),
        )

    def test_login_exitoso(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_credenciales_invalidas(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_usuario_inexistente(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "noexiste", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class LogoutViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="testuser",
            nombre="Test",
            email="test@test.com",
            rol="Gerente",
            password=make_password("pass123"),
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "pass123"},
            format="json",
        )
        self.access = response.data["access"]
        self.refresh = response.data["refresh"]

    def test_logout_exitoso(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": self.refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_sin_refresh(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(
            "/api/auth/logout/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_sin_autenticacion(self):
        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": self.refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class UsuarioViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="admin",
            nombre="Admin",
            email="admin@test.com",
            rol="Administrador",
            password=make_password("admin123"),
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "admin123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_listar(self):
        response = self.client.get("/api/auth/usuarios/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear(self):
        response = self.client.post(
            "/api/auth/usuarios/",
            {
                "username": "newuser",
                "email": "new@test.com",
                "nombre": "New User",
                "rol": "Almacenero",
                "password": "pass123",
                "password2": "pass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "newuser")

    def test_retrieve(self):
        response = self.client.get(f"/api/auth/usuarios/{self.usuario.id_usuario}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "admin")

    def test_update(self):
        response = self.client.put(
            f"/api/auth/usuarios/{self.usuario.id_usuario}/",
            {
                "username": "admin",
                "email": "admin@test.com",
                "nombre": "Updated Admin",
                "rol": "Administrador",
                "activo": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "Updated Admin")

    def test_destroy(self):
        response = self.client.delete(
            f"/api/auth/usuarios/{self.usuario.id_usuario}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.activo)

    def test_cambiar_password(self):
        response = self.client.post(
            f"/api/auth/usuarios/{self.usuario.id_usuario}/cambiar_password/",
            {
                "password_actual": "admin123",
                "password_nuevo": "newpass",
                "password_nuevo2": "newpass",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
