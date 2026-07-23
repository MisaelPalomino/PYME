from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class DashboardViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.dashboard.views.DashboardService.obtener")
    def test_dashboard_ok(self, mock_obtener):
        mock_obtener.return_value = {
            "ventas_diarias": [],
            "resumen": {"total_productos": 100},
            "stock_critico": [],
            "alertas_activas": [],
        }
        response = self.client.get("/api/dashboard/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.dashboard.views.DashboardService.obtener")
    def test_dashboard_vacio(self, mock_obtener):
        mock_obtener.return_value = {}
        response = self.client.get("/api/dashboard/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
