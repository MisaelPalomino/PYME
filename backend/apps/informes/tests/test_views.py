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
class BajoStockViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.informes.views.ReporteService.bajo_stock")
    def test_json(self, mock_bajo_stock):
        mock_bajo_stock.return_value = [
            {
                "id_producto": 1, "nombre": "Mouse", "sku": "MOU123",
                "categoria": "Hardware", "stock_actual": 0, "stock_minimo": 5,
                "deficit": 5, "lead_time_dias": 7, "estado": "Agotado",
            }
        ]
        response = self.client.get("/api/informes/bajo-stock/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.informes.views.ReporteService.bajo_stock")
    def test_con_categoria(self, mock_bajo_stock):
        mock_bajo_stock.return_value = []
        response = self.client.get("/api/informes/bajo-stock/?categoria=1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_bajo_stock.assert_called_once_with(categoria=1)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class RotacionViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.informes.views.ReporteService.rotacion")
    def test_json(self, mock_rotacion):
        mock_rotacion.return_value = [
            {
                "id_producto": 1, "nombre": "Mouse", "sku": "MOU123",
                "ventas_periodo": 50, "stock_promedio": 100, "indice_rotacion": 0.50,
            }
        ]
        response = self.client.get("/api/informes/rotacion/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.informes.views.ReporteService.rotacion")
    def test_con_periodo(self, mock_rotacion):
        mock_rotacion.return_value = []
        response = self.client.get("/api/informes/rotacion/?periodo=semana")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_rotacion.assert_called_once_with(categoria=None, periodo="semana")


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class ConsolidadoViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.informes.views.ReporteService.consolidado")
    def test_json(self, mock_consolidado):
        mock_consolidado.return_value = {
            "resumen": {
                "productos_bajo_stock": 10,
                "alertas_criticas_ia": 5,
                "mae_promedio": 2.50,
                "mape_promedio": 15.30,
            },
            "ultimas_semanas": [],
            "metricas_por_producto": [],
        }
        response = self.client.get("/api/informes/consolidado/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class GraficoComprasVentasViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.informes.views.ReporteService.graficos_compras_ventas")
    def test_json(self, mock_graficos):
        mock_graficos.return_value = [
            {"periodo": "2024-01-01T00:00:00Z", "ventas": 1000, "compras": 500}
        ]
        response = self.client.get("/api/informes/graficos-compras-ventas/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.informes.views.ReporteService.graficos_compras_ventas")
    def test_con_filtros(self, mock_graficos):
        mock_graficos.return_value = []
        response = self.client.get(
            "/api/informes/graficos-compras-ventas/?categoria=1&periodo=semana"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_graficos.assert_called_once_with(categoria=1, periodo="semana")
