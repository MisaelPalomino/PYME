from django.test import TestCase
from decimal import Decimal
from apps.ia.models import Prediccion
from apps.core.models import Categoria, Producto, Proveedor


class PrediccionModelTest(TestCase):
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

    def test_str(self):
        expected = f"Predicción para {self.producto.nombre} - {self.prediccion.demanda_predicha}"
        self.assertEqual(str(self.prediccion), expected)

    def test_fecha_generacion_auto(self):
        self.assertIsNotNone(self.prediccion.fecha_generacion)

    def test_horizonte_dias(self):
        self.assertEqual(self.prediccion.horizonte_dias, 7)

    def test_demanda_predicha(self):
        self.assertEqual(self.prediccion.demanda_predicha, Decimal("15.50"))
