from django.test import TestCase
from apps.inventario.serializer import (
    HistorialMovimientoSerializer,
    HistorialProductoSerializer,
    InventarioStockSerializer,
    ProductoStockSerializer,
)


class ProductoStockSerializerTest(TestCase):
    def test_valido(self):
        serializer = ProductoStockSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "stock_actual": 10,
                "estado_stock": "Normal",
            }
        )
        self.assertTrue(serializer.is_valid())


class InventarioStockSerializerTest(TestCase):
    def test_valido(self):
        serializer = InventarioStockSerializer(
            data={
                "total": 100,
                "stock_agotado": 5,
                "stock_critico": 10,
                "stock_normal": 85,
                "productos": [],
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_con_productos(self):
        serializer = InventarioStockSerializer(
            data={
                "total": 100,
                "stock_agotado": 5,
                "stock_critico": 10,
                "stock_normal": 85,
                "productos": [
                    {
                        "id_producto": 1,
                        "nombre": "Mouse",
                        "stock_actual": 10,
                        "estado_stock": "Normal",
                    }
                ],
            }
        )
        self.assertTrue(serializer.is_valid())


class HistorialMovimientoSerializerTest(TestCase):
    def test_valido(self):
        serializer = HistorialMovimientoSerializer(
            data={
                "fecha": "2024-01-01T10:00:00Z",
                "tipo_movimiento": "entrada",
                "cantidad": 5,
                "observaciones": "Compra",
            }
        )
        self.assertTrue(serializer.is_valid())


class HistorialProductoSerializerTest(TestCase):
    def test_valido(self):
        serializer = HistorialProductoSerializer(
            data={
                "id_producto": 1,
                "historial": [],
            }
        )
        self.assertTrue(serializer.is_valid())
