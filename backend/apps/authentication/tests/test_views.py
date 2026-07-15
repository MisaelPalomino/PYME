from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Usuario

LOGIN_URL = '/api/auth/login/'
LOGOUT_URL = '/api/auth/logout/'
REFRESH_URL = '/api/auth/token/refresh/'


class LoginViewTest(APITestCase):
    """
    LoginView usa AllowAny: estas pruebas nunca autentican al cliente a propósito, para confirmar que
    el endpoint es accesible sin token.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe", password="pass1234", nombre="John Doe",
            email="john@test.com", rol="Administrador", activo=True,
        )

    def test_login_valido_devuelve_tokens_y_datos_usuario(self):
        response = self.client.post(
            LOGIN_URL, {"username": "jdoe", "password": "pass1234"}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["usuario"]["username"], "jdoe")

    def test_login_password_incorrecta_devuelve_400(self):
        response = self.client.post(
            LOGIN_URL, {"username": "jdoe", "password": "mala"}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_usuario_desactivado_devuelve_400(self):
        self.usuario.activo = False
        self.usuario.save()
        response = self.client.post(
            LOGIN_URL, {"username": "jdoe", "password": "pass1234"}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutViewTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe", password="pass1234", nombre="John Doe",
            email="john@test.com", rol="Administrador", activo=True,
        )
        self.refresh = RefreshToken.for_user(self.usuario)
        self.access = str(self.refresh.access_token)

    def _autenticar(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')

    def test_logout_sin_autenticacion_devuelve_401(self):
        response = self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_sin_campo_refresh_devuelve_400(self):
        self._autenticar()
        response = self.client.post(LOGOUT_URL, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_exitoso_devuelve_200(self):
        self._autenticar()
        response = self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalida_el_refresh_token(self):
        self._autenticar()
        self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)}, format='json')

        self.client.credentials()
        response = self.client.post(REFRESH_URL, {"refresh": str(self.refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)