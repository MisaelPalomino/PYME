from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Usuario

LOGIN_URL = '/api/auth/login/'
LOGOUT_URL = '/api/auth/logout/'
REFRESH_URL = '/api/auth/token/refresh/'
USUARIOS_URL = '/api/auth/usuarios/'

def usuario_detalle_url(pk):
    return f'{USUARIOS_URL}{pk}/'


def cambiar_password_url(pk):
    return f'{USUARIOS_URL}{pk}/cambiar_password/'

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

class UsuarioViewSetTest(APITestCase):
    """
    Autentica con un token JWT real (no force_authenticate) para probar el flujo completo:
    header -> JWTAuthentication -> Usuario.objects.get().
    """

    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe", password="pass1234", nombre="John Doe",
            email="john@test.com", rol="Administrador", activo=True,
        )
        access = str(RefreshToken.for_user(self.usuario).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

    def test_list_sin_autenticacion_devuelve_401(self):
        self.client.credentials()
        response = self.client.get(USUARIOS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_autenticado_devuelve_usuarios(self):
        response = self.client.get(USUARIOS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_existente(self):
        response = self.client.get(usuario_detalle_url(self.usuario.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "jdoe")

    def test_retrieve_inexistente_devuelve_404(self):
        response = self.client.get(usuario_detalle_url(9999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_usuario_valido_devuelve_201(self):
        payload = {
            "username": "nuevo", "email": "nuevo@test.com", "nombre": "Nuevo Usuario",
            "rol": "Comprador", "password": "clave123", "password2": "clave123",
        }
        response = self.client.post(USUARIOS_URL, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Usuario.objects.count(), 2)
        self.assertNotIn("password", response.data)

    def test_create_rol_invalido_devuelve_400(self):
        payload = {
            "username": "nuevo", "email": "nuevo@test.com", "nombre": "Nuevo Usuario",
            "rol": "Inventado", "password": "clave123", "password2": "clave123",
        }
        response = self.client.post(USUARIOS_URL, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_usuario(self):
        payload = {
            "username": "jdoe", "email": "john@test.com",
            "nombre": "John Actualizado", "rol": "Gerente", "activo": True,
        }
        response = self.client.put(usuario_detalle_url(self.usuario.pk), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "John Actualizado")

    def test_destroy_desactiva_sin_eliminar(self):
        response = self.client.delete(usuario_detalle_url(self.usuario.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.activo)
        self.assertEqual(Usuario.objects.count(), 1)

    def test_cambiar_password_correcto(self):
        payload = {
            "password_actual": "pass1234",
            "password_nuevo": "nueva456",
            "password_nuevo2": "nueva456",
        }
        response = self.client.post(cambiar_password_url(self.usuario.pk), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.password, "nueva456")

    def test_cambiar_password_actual_incorrecta_devuelve_400(self):
        payload = {
            "password_actual": "password-equivocada",
            "password_nuevo": "nueva456",
            "password_nuevo2": "nueva456",
        }
        response = self.client.post(cambiar_password_url(self.usuario.pk), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)