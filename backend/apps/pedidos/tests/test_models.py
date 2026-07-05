from django.test import TestCase
from apps.core.models import Proveedor, Producto, Categoria
from apps.authentication.models import Usuario
from apps.pedidos.models import Pedido, DetallePedido


class PedidoModelTest(TestCase):
    def setUp(self):

        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.usuario = Usuario.objects.create(username="testuser")

        self.pedido = Pedido.objects.create(
            id_proveedor=self.proveedor, id_usuario=self.usuario, estado="pendiente"
        )

    def test_str_pedido(self):

        self.assertEqual(
            str(self.pedido), f"Pedido #{self.pedido.id_pedido} - pendiente"
        )

    def test_estado_valido(self):

        self.assertIn(self.pedido.estado, ["pendiente", "enviado", "recibido"])


class DetallePedidoModelTest(TestCase):
    def setUp(self):

        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")

        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.usuario = Usuario.objects.create(username="testuser")

        self.pedido = Pedido.objects.create(
            id_proveedor=self.proveedor, id_usuario=self.usuario
        )

        self.producto = Producto.objects.create(
            nombre="Mouse",
            sku="MOU123",
            descripcion="",
            stock_actual=10,
            stock_minimo=2,
            stock_maximo=20,
            precio=50,
            id_categoria=self.categoria,  # 👈 AQUÍ estaba el problema
            id_proveedor_principal=self.proveedor,
        )

        self.detalle = DetallePedido.objects.create(
            id_pedido=self.pedido,
            id_producto=self.producto,
            cantidad=2,
            precio_unitario=50,
        )

    def test_str_detalle(self):

        self.assertEqual(
            str(self.detalle),
            f"Detalle {self.detalle.id_detalle} - Pedido {self.pedido.id_pedido}",
        )
