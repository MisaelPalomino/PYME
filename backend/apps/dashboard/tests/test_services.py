from django.test import TestCase
from unittest.mock import patch, MagicMock
from apps.dashboard.service import DashboardService


class DashboardServiceTest(TestCase):
    @patch("apps.dashboard.service.connection")
    def test_obtener(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("ventas_diarias",), ("resumen",), ("stock_critico",), ("alertas_activas",)
        ]
        mock_cursor.fetchone.return_value = (
            '{"ventas_diarias": []}',
            '{"total_productos": 100}',
            '[]',
            '[]',
        )
        mock_connection.cursor.return_value = mock_cursor

        result = DashboardService.obtener()

        self.assertIn("ventas_diarias", result)
        self.assertIn("resumen", result)

    @patch("apps.dashboard.service.connection")
    def test_obtener_error(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.fetchone.return_value = None
        mock_connection.cursor.return_value = mock_cursor

        result = DashboardService.obtener()

        self.assertEqual(result, {})
