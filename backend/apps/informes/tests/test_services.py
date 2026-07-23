from django.test import TestCase
from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta

from apps.informes.service import ReporteService, PERIODOS_DIAS, _fecha_desde


class ReporteServiceTest(TestCase):
    @patch("apps.informes.service.connection")
    def test_bajo_stock(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("id_producto",), ("nombre",), ("sku",), ("categoria",),
            ("stock_actual",), ("stock_minimo",), ("deficit",),
            ("lead_time_dias",), ("estado",),
        ]
        mock_cursor.fetchall.return_value = [
            (1, "Mouse", "MOU123", "Hardware", 0, 5, 5, 7, "Agotado"),
            (2, "Teclado", "TEC456", "Hardware", 2, 5, 3, 10, "Critico"),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = ReporteService.bajo_stock()

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["estado"], "Agotado")
        self.assertEqual(result[1]["estado"], "Critico")

    @patch("apps.informes.service.connection")
    def test_bajo_stock_con_categoria(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("id_producto",), ("nombre",), ("sku",), ("categoria",),
            ("stock_actual",), ("stock_minimo",), ("deficit",),
            ("lead_time_dias",), ("estado",),
        ]
        mock_cursor.fetchall.return_value = []
        mock_connection.cursor.return_value = mock_cursor

        ReporteService.bajo_stock(categoria=1)

        mock_cursor.execute.assert_called_once()
        call_args = mock_cursor.execute.call_args
        self.assertEqual(call_args[0][1]["categoria"], 1)

    @patch("apps.informes.service.connection")
    def test_rotacion(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("id_producto",), ("nombre",), ("sku",),
            ("ventas_periodo",), ("stock_promedio",), ("indice_rotacion",),
        ]
        mock_cursor.fetchall.return_value = [
            (1, "Mouse", "MOU123", 50, 100, 0.50),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = ReporteService.rotacion(periodo="mes")

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["ventas_periodo"], 50)

    @patch("apps.informes.service.connection")
    def test_consolidado(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)

        mock_cursor.description = [
            ("productos_bajo_stock",), ("alertas_criticas_ia",),
            ("mae_promedio",), ("mape_promedio",),
        ]
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = (10, 5, 2.50, 15.30)

        result = ReporteService.consolidado()

        self.assertIn("resumen", result)
        self.assertIn("ultimas_semanas", result)
        self.assertIn("metricas_por_producto", result)

    @patch("apps.informes.service.connection")
    def test_graficos_compras_ventas(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("periodo",), ("ventas",), ("compras",),
        ]
        mock_cursor.fetchall.return_value = [
            (timezone.now(), 1000, 500),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = ReporteService.graficos_compras_ventas(periodo="semana")

        self.assertEqual(len(result), 1)

    def test_fecha_desde_semana(self):
        fecha = _fecha_desde("semana")
        self.assertGreater(fecha, timezone.now() - timedelta(days=8))

    def test_fecha_desde_periodo_invalido(self):
        fecha = _fecha_desde("invalido")
        self.assertGreater(fecha, timezone.now() - timedelta(days=31))
