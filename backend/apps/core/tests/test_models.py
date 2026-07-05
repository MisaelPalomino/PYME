from django.test import TestCase

from ..models import Categoria, Producto, Proveedor


class CategoriaModelTest(TestCase):
    def test_str(self):
        categoria = Categoria(nombre="Electrónicos")

        self.assertEqual(str(categoria), "Electrónicos")


class ProductoModelTest(TestCase):
    def test_str(self):

        categoria = Categoria.objects.create(nombre="Hardware", descripcion="")

        proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="juan@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        producto = Producto.objects.create(
            nombre="Mouse",
            sku="ABC123",
            descripcion="",
            stock_actual=5,
            stock_minimo=2,
            stock_maximo=10,
            precio=15,
            id_categoria=categoria,
            id_proveedor_principal=proveedor,
        )

        self.assertEqual(str(producto), "Mouse (ABC123)")
