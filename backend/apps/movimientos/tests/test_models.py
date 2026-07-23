from django.contrib.auth.hashers import make_password
from django.test import TestCase
from django.utils import timezone

from apps.core.models import Categoria, Producto, Proveedor
from apps.authentication.models import Usuario
from apps.movimientos.models import Movimiento


class MovimientoModelTest(TestCase):
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
            rol="Almacenero", password=make_password("pass123"),
        )
        self.movimiento = Movimiento.objects.create(
            tipo_movimiento="entrada",
            fecha=timezone.now(),
            cantidad=5,
            observaciones="Compra inicial",
            id_producto=self.producto,
            id_usuario=self.usuario,
        )

    def test_str(self):
        expected = f"entrada - 5 de {self.producto.nombre}"
        self.assertEqual(str(self.movimiento), expected)

    def test_tipo_movimiento_choices(self):
        self.assertIn(self.movimiento.tipo_movimiento, ["entrada", "salida"])
