from django.test import TestCase
from decimal import Decimal
from apps.ia.serializer import (
    GenerarPrediccionSerializer,
    PrediccionSerializer,
    ProductoPrediccionSerializer,
)
from apps.core.models import Categoria, Producto, Proveedor
from apps.ia.models import Prediccion


class PrediccionSerializerTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")
        self.proveedor = Proveedor.objects.create(
            nombre="Prov", contacto="Juan", correo="a@test.com",
            telefono="123", lead_time_dias=5,
        )
        self.producto = Producto.objects.create(
            nombre="Mouse", sku="MOU123", descripcion="",
            stock_actual=10, stock_minimo=2, stock_maximo=20,
            precio=50, id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )
        self.prediccion = Prediccion.objects.create(
            id_producto=self.producto,
            horizonte_dias=7,
            demanda_predicha=Decimal("15.50"),
        )

    def test_serializacion(self):
        serializer = PrediccionSerializer(self.prediccion)
        data = serializer.data
        self.assertEqual(data["horizonte_dias"], 7)
        self.assertEqual(data["producto_nombre"], "Mouse")
        self.assertIn("id_prediccion", data)


class ProductoPrediccionSerializerTest(TestCase):
    def test_valido(self):
        serializer = ProductoPrediccionSerializer(
            data={
                "producto_id": 1,
                "producto_nombre": "Mouse",
                "sku": "MOU123",
                "stock_actual": 10,
                "prediccion_7d": Decimal("15.50"),
                "prediccion_14d": Decimal("25.00"),
                "prediccion_21d": Decimal("35.00"),
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_predicciones_null(self):
        serializer = ProductoPrediccionSerializer(
            data={
                "producto_id": 1,
                "producto_nombre": "Mouse",
                "sku": "MOU123",
                "stock_actual": 10,
                "prediccion_7d": None,
                "prediccion_14d": None,
                "prediccion_21d": None,
            }
        )
        self.assertTrue(serializer.is_valid())


class GenerarPrediccionSerializerTest(TestCase):
    def test_valido_con_predicciones(self):
        serializer = GenerarPrediccionSerializer(
            data={
                "producto_id": 1,
                "producto_nombre": "Mouse",
                "estado": "entrenado",
                "mae": Decimal("2.5000"),
                "mape": Decimal("15.3000"),
                "n_muestras": 50,
                "predicciones": [
                    {"dias": 7, "demanda_predicha": Decimal("15.50")},
                    {"dias": 14, "demanda_predicha": Decimal("25.00")},
                    {"dias": 21, "demanda_predicha": Decimal("35.00")},
                ],
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_valido_sin_datos(self):
        serializer = GenerarPrediccionSerializer(
            data={
                "producto_id": 1,
                "producto_nombre": "Mouse",
                "estado": "sin_datos",
                "mensaje": "No hay suficientes datos",
                "n_muestras": 0,
            }
        )
        self.assertTrue(serializer.is_valid())
