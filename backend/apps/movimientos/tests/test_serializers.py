from django.test import TestCase
from django.utils import timezone

from apps.core.models import Categoria, Producto, Proveedor
from apps.authentication.models import Usuario
from apps.movimientos.models import Movimiento
from apps.movimientos.serializer import MovimientoCreateSerializer, MovimientoSerializer


class MovimientoCreateSerializerTest(TestCase):
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

    def test_entrada_valida(self):
        serializer = MovimientoCreateSerializer(
            data={
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
                "observaciones": "Compra",
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_salida_valida(self):
        serializer = MovimientoCreateSerializer(
            data={
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 3,
            }
        )
        self.assertTrue(serializer.is_valid())

    def test_tipo_invalido(self):
        serializer = MovimientoCreateSerializer(
            data={
                "tipo_movimiento": "devolucion",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("tipo_movimiento", serializer.errors)

    def test_cantidad_minima(self):
        serializer = MovimientoCreateSerializer(
            data={
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 0,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("cantidad", serializer.errors)

    def test_cantidad_negativa(self):
        serializer = MovimientoCreateSerializer(
            data={
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": -1,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("cantidad", serializer.errors)


class MovimientoSerializerTest(TestCase):
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
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password="pass123",
        )
        self.movimiento = Movimiento.objects.create(
            tipo_movimiento="entrada",
            fecha=timezone.now(),
            cantidad=5,
            observaciones="Compra",
            id_producto=self.producto,
            id_usuario=self.usuario,
        )

    def test_serializacion(self):
        serializer = MovimientoSerializer(self.movimiento)
        data = serializer.data
        self.assertEqual(data["tipo_movimiento"], "entrada")
        self.assertEqual(data["cantidad"], 5)
        self.assertEqual(data["producto_nombre"], "Mouse")
        self.assertEqual(data["producto_sku"], "MOU123")
        self.assertEqual(data["responsable"], "User")
