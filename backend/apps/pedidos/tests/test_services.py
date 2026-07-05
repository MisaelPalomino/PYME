from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist

from apps.core.models import Categoria, Proveedor, Producto
from apps.authentication.models import Usuario
from apps.pedidos.models import Pedido, DetallePedido
from apps.pedidos.service import PedidoService


class PedidoServiceTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(username="user")

        self.proveedor = Proveedor.objects.create(
            nombre="Prov",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.pedido1 = Pedido.objects.create(
            id_proveedor=self.proveedor, id_usuario=self.usuario, estado="pendiente"
        )

        self.pedido2 = Pedido.objects.create(
            id_proveedor=self.proveedor, id_usuario=self.usuario, estado="enviado"
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

    def test_listar_orden_descendente(self):

        pedidos = list(PedidoService.listar())

        self.assertEqual(pedidos[0].id_pedido, self.pedido2.id_pedido)

    def test_obtener(self):

        pedido = PedidoService.obtener(self.pedido1.id_pedido)

        self.assertEqual(pedido.id_pedido, self.pedido1.id_pedido)

    def test_crear_pedido(self):

        class FakeSerializer:
            def __init__(self, data):
                self.validated_data = data

        serializer = FakeSerializer(
            {
                "id_proveedor": self.proveedor,
                "id_usuario": self.usuario,
                "estado": "pendiente",
                "detalles": [
                    {"id_producto": self.producto, "cantidad": 2, "precio_unitario": 50}
                ],
            }
        )

        pedido = PedidoService.crear(serializer)

        # 2 de setup + 1 creado
        self.assertEqual(Pedido.objects.count(), 3)
        self.assertEqual(DetallePedido.objects.count(), 1)
        self.assertEqual(pedido.id_proveedor, self.proveedor)

    def test_actualizar_estado_enviado(self):

        pedido = PedidoService.actualizar_estado(self.pedido1.id_pedido, "enviado")

        self.assertEqual(pedido.estado, "enviado")
        self.assertIsNotNone(pedido.fecha_envio)

    def test_estado_invalido(self):

        with self.assertRaises(ValueError):
            PedidoService.actualizar_estado(self.pedido1.id_pedido, "cancelado")

    def test_no_cambiar_recibido(self):

        self.pedido1.estado = "recibido"
        self.pedido1.save()

        with self.assertRaises(ValueError):
            PedidoService.actualizar_estado(self.pedido1.id_pedido, "pendiente")

    def test_recibir_pedido(self):

        pedido = PedidoService.recibir_pedido(self.pedido1.id_pedido)

        self.assertEqual(pedido.estado, "recibido")
        self.assertIsNotNone(pedido.fecha_recepcion)

    def test_recibir_ya_recibido(self):

        self.pedido1.estado = "recibido"
        self.pedido1.save()

        with self.assertRaises(ValueError):
            PedidoService.recibir_pedido(self.pedido1.id_pedido)

    def test_eliminar_pedido(self):

        PedidoService.eliminar(self.pedido1.id_pedido)

        # Queda pedido 2
        self.assertEqual(Pedido.objects.count(), 1)

    def test_no_eliminar_recibido(self):

        self.pedido1.estado = "recibido"
        self.pedido1.save()

        with self.assertRaises(ValueError):
            PedidoService.eliminar(self.pedido1.id_pedido)
