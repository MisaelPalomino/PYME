from django.test import TestCase
from ..models import Categoria, Proveedor
from ..serializer import CategoriaSerializer, ProductoSerializer


class CategoriaSerializerTest(TestCase):
    def test_categoria_valida_y_strip_nombre(self):

        data = {"nombre": "  Electrónicos  ", "descripcion": "Desc"}

        serializer = CategoriaSerializer(data=data)

        self.assertTrue(serializer.is_valid())

        categoria = serializer.save()

        self.assertEqual(categoria.nombre, "Electrónicos")

    def test_categoria_nombre_vacio(self):

        serializer = CategoriaSerializer(data={"nombre": "   ", "descripcion": "Desc"})

        self.assertFalse(serializer.is_valid())
        self.assertIn("nombre", serializer.errors)


class ProductoSerializerTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")

        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="juan@test.com",
            telefono="123",
            lead_time_dias=3,
        )

    def test_producto_valido(self):

        serializer = ProductoSerializer(
            data={
                "nombre": "Mouse",
                "sku": "MOU123",
                "descripcion": "Mouse gamer",
                "precio": 50,
                "stock_actual": 10,
                "stock_minimo": 2,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_precio_invalido(self):

        serializer = ProductoSerializer(
            data={
                "nombre": "Mouse",
                "sku": "MOU123",
                "descripcion": "Mouse gamer",
                "precio": 0,
                "stock_actual": 10,
                "stock_minimo": 2,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("precio", serializer.errors)

    def test_stock_min_mayor_que_max(self):

        serializer = ProductoSerializer(
            data={
                "nombre": "Mouse",
                "sku": "MOU123",
                "descripcion": "Mouse gamer",
                "precio": 50,
                "stock_actual": 10,
                "stock_minimo": 30,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("stock_minimo", serializer.errors)

    def test_stock_actual_mayor_que_max(self):

        serializer = ProductoSerializer(
            data={
                "nombre": "Mouse",
                "sku": "MOU123",
                "descripcion": "Mouse gamer",
                "precio": 50,
                "stock_actual": 30,
                "stock_minimo": 2,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("stock_actual", serializer.errors)
