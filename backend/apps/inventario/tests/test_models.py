from django.contrib.auth.hashers import make_password
from django.test import TestCase
from apps.inventario.models import Alerta, Notificacion
from apps.core.models import Categoria, Producto, Proveedor
from apps.authentication.models import Usuario


class AlertaModelTest(TestCase):
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
        self.alerta = Alerta.objects.create(
            mensaje="Stock bajo",
            id_producto=self.producto,
            tipo_alerta="stock_bajo",
        )

    def test_str(self):
        expected = f"{self.alerta.tipo_alerta}: {self.alerta.mensaje[:30]}..."
        self.assertEqual(str(self.alerta), expected)

    def test_leida_default(self):
        self.assertFalse(self.alerta.leida)


class NotificacionModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password=make_password("pass123"),
        )
        self.notificacion = Notificacion.objects.create(
            id_usuario=self.usuario,
            mensaje="Tienes una notificación",
            titulo="Alerta",
        )

    def test_str(self):
        self.assertIn(self.notificacion.titulo, str(self.notificacion))

    def test_leida_default(self):
        self.assertFalse(self.notificacion.leida)
