from django.test import TestCase
from apps.informes.serializer import (
    BajoStockItemSerializer,
    ConsolidadoMetricaProductoSerializer,
    ConsolidadoResumenSerializer,
    ConsolidadoSemanaSerializer,
    ConsolidadoSerializer,
    GraficoComprasVentasItemSerializer,
    RotacionItemSerializer,
)


class BajoStockItemSerializerTest(TestCase):
    def test_valido(self):
        serializer = BajoStockItemSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "sku": "MOU123",
                "categoria": "Hardware",
                "stock_actual": 0,
                "stock_minimo": 5,
                "deficit": 5,
                "lead_time_dias": 7,
                "estado": "Agotado",
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_critico(self):
        serializer = BajoStockItemSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "sku": "MOU123",
                "categoria": "Hardware",
                "stock_actual": 2,
                "stock_minimo": 5,
                "deficit": 3,
                "lead_time_dias": 7,
                "estado": "Critico",
            }
        )
        self.assertTrue(serializer.is_valid())


class RotacionItemSerializerTest(TestCase):
    def test_valido(self):
        serializer = RotacionItemSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "sku": "MOU123",
                "ventas_periodo": 50,
                "stock_promedio": 100,
                "indice_rotacion": 0.50,
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_indice_null(self):
        serializer = RotacionItemSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "sku": "MOU123",
                "ventas_periodo": 0,
                "stock_promedio": 0,
                "indice_rotacion": None,
            }
        )
        self.assertTrue(serializer.is_valid())


class ConsolidadoResumenSerializerTest(TestCase):
    def test_valido(self):
        serializer = ConsolidadoResumenSerializer(
            data={
                "productos_bajo_stock": 10,
                "alertas_criticas_ia": 5,
                "mae_promedio": 2.50,
                "mape_promedio": 15.30,
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_campos_null(self):
        serializer = ConsolidadoResumenSerializer(
            data={
                "productos_bajo_stock": 0,
                "alertas_criticas_ia": 0,
                "mae_promedio": None,
                "mape_promedio": None,
            }
        )
        self.assertTrue(serializer.is_valid())


class ConsolidadoSemanaSerializerTest(TestCase):
    def test_valido(self):
        serializer = ConsolidadoSemanaSerializer(
            data={
                "periodo": "2024-01-01T00:00:00Z",
                "ventas": 1000.50,
                "compras": 500.25,
            }
        )
        self.assertTrue(serializer.is_valid())


class ConsolidadoMetricaProductoSerializerTest(TestCase):
    def test_valido(self):
        serializer = ConsolidadoMetricaProductoSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "mae": 2.50,
                "mape": 15.30,
                "estado_modelo": "Bueno",
                "alerta": "Normal",
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_estado_modelo_null(self):
        serializer = ConsolidadoMetricaProductoSerializer(
            data={
                "id_producto": 1,
                "nombre": "Mouse",
                "mae": None,
                "mape": None,
                "estado_modelo": None,
                "alerta": "Normal",
            }
        )
        self.assertTrue(serializer.is_valid())


class GraficoComprasVentasItemSerializerTest(TestCase):
    def test_valido(self):
        serializer = GraficoComprasVentasItemSerializer(
            data={
                "periodo": "2024-01-01T00:00:00Z",
                "ventas": 1000.50,
                "compras": 500.25,
            }
        )
        self.assertTrue(serializer.is_valid())
