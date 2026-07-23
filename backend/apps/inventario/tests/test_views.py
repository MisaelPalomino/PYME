from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock

from apps.authentication.models import Usuario


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class StockInventarioViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password="pass123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    @patch("apps.inventario.views.InventarioService.obtener_stock")
    def test_stock_ok(self, mock_obtener_stock):
        mock_obtener_stock.return_value = [
            {"id_producto": 1, "nombre": "Mouse", "stock_actual": 10, "estado_stock": "Normal"}
        ]
        response = self.client.get("/api/inventario/stock/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.inventario.views.InventarioService.obtener_stock")
    def test_stock_con_categoria(self, mock_obtener_stock):
        mock_obtener_stock.return_value = []
        response = self.client.get("/api/inventario/stock/?categoria=1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        args, kwargs = mock_obtener_stock.call_args
        self.assertEqual(int(args[0]), 1)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class HistorialProductoViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password="pass123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    @patch("apps.inventario.views.InventarioService.historial_producto")
    def test_historial_ok(self, mock_historial):
        mock_historial.return_value = [
            {"fecha": "2024-01-01", "tipo_movimiento": "entrada", "cantidad": 5, "observaciones": ""}
        ]
        response = self.client.get("/api/inventario/historial/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_historial.assert_called_once_with(1)
