from django.test import TestCase
from django.utils import timezone

from apps.core.models import Categoria, Proveedor, Producto
from apps.pedidos.models import Pedido, DetallePedido
from apps.authentication.models import Usuario

from apps.pedidos.serializer import PedidoSerializer, DetallePedidoSerializer


class DetallePedidoSerializerTest(TestCase):
    def setUp(self):

        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")

        self.proveedor = Proveedor.objects.create(
            nombre="Prov",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.producto = Producto.objects.create(
            nombre="Mouse",
            sku="MOU123",
            descripcion="",
            stock_actual=10,
            stock_minimo=2,
            stock_maximo=20,
            precio=50,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def test_detalle_valido(self):

        serializer = DetallePedidoSerializer(
            data={
                "id_producto": self.producto.id_producto,
                "cantidad": 2,
                "precio_unitario": 50,
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_cantidad_invalida(self):

        serializer = DetallePedidoSerializer(
            data={
                "id_producto": self.producto.id_producto,
                "cantidad": 0,
                "precio_unitario": 50,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("cantidad", serializer.errors)

    def test_precio_invalido(self):

        serializer = DetallePedidoSerializer(
            data={
                "id_producto": self.producto.id_producto,
                "cantidad": 2,
                "precio_unitario": 0,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("precio_unitario", serializer.errors)


class PedidoSerializerTest(TestCase):
    def setUp(self):

        self.usuario = Usuario.objects.create(username="testuser")

        self.proveedor = Proveedor.objects.create(
            nombre="Prov",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")

        self.producto = Producto.objects.create(
            nombre="Mouse",
            sku="MOU123",
            descripcion="",
            stock_actual=10,
            stock_minimo=2,
            stock_maximo=20,
            precio=50,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

        self.pedido = Pedido.objects.create(
            id_proveedor=self.proveedor, id_usuario=self.usuario, estado="pendiente"
        )

        self.detalle = DetallePedido.objects.create(
            id_pedido=self.pedido,
            id_producto=self.producto,
            cantidad=2,
            precio_unitario=50,
        )

    def test_pedido_serializado(self):

        serializer = PedidoSerializer(self.pedido)

        self.assertEqual(serializer.data["id_pedido"], self.pedido.id_pedido)
        self.assertEqual(serializer.data["proveedor_nombre"], self.proveedor.nombre)
        self.assertEqual(serializer.data["usuario_nombre"], self.usuario.nombre)

    def test_detalles_vacios(self):

        serializer = PedidoSerializer(
            data={
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "estado": "pendiente",
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_detalles_duplicados(self):

        data = {"id_producto": self.producto, "cantidad": 1, "precio_unitario": 50}

        serializer = PedidoSerializer()

        with self.assertRaises(Exception):
            serializer.validate_detalles([data, data])
