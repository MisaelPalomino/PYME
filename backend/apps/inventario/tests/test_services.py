from django.test import TestCase
from unittest.mock import patch, MagicMock
from apps.inventario.service import InventarioService


class InventarioServiceTest(TestCase):
    @patch("apps.inventario.service.connection")
    def test_obtener_stock_sin_categoria(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("id_producto",), ("nombre",), ("stock_actual",), ("estado_stock",)
        ]
        mock_cursor.fetchall.return_value = [
            (1, "Mouse", 10, "Normal"),
            (2, "Teclado", 0, "Agotado"),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = InventarioService.obtener_stock()

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["nombre"], "Mouse")
        self.assertEqual(result[1]["estado_stock"], "Agotado")

    @patch("apps.inventario.service.connection")
    def test_obtener_stock_con_categoria(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("id_producto",), ("nombre",), ("stock_actual",), ("estado_stock",)
        ]
        mock_cursor.fetchall.return_value = [
            (1, "Mouse", 10, "Normal"),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = InventarioService.obtener_stock(categoria=1)

        self.assertEqual(len(result), 1)
        mock_cursor.execute.assert_called_once_with(
            "SELECT * FROM obtener_stock_por_estado(%s)", [1]
        )

    @patch("apps.inventario.service.connection")
    def test_historial_producto(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("fecha",), ("tipo_movimiento",), ("cantidad",), ("observaciones",)
        ]
        mock_cursor.fetchall.return_value = [
            ("2024-01-01", "entrada", 5, "Compra"),
            ("2024-01-02", "salida", 2, "Venta"),
        ]
        mock_connection.cursor.return_value = mock_cursor

        result = InventarioService.historial_producto(1)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["tipo_movimiento"], "entrada")
        mock_cursor.execute.assert_called_once_with(
            "SELECT * FROM historial_producto(%s)", [1]
        )

    @patch("apps.inventario.service.connection")
    def test_historial_producto_vacio(self, mock_connection):
        mock_cursor = MagicMock()
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_cursor.description = [
            ("fecha",), ("tipo_movimiento",), ("cantidad",), ("observaciones",)
        ]
        mock_cursor.fetchall.return_value = []
        mock_connection.cursor.return_value = mock_cursor

        result = InventarioService.historial_producto(999)

        self.assertEqual(len(result), 0)
