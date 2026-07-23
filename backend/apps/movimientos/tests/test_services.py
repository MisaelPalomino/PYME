from django.test import TestCase
from django.utils import timezone
from rest_framework import serializers

from apps.core.models import Categoria, Producto, Proveedor
from apps.authentication.models import Usuario
from apps.movimientos.models import Movimiento
from apps.movimientos.service import MovimientoService


class MovimientoServiceTest(TestCase):
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

    def test_registrar_entrada(self):
        movimiento = MovimientoService.registrar(
            tipo_movimiento="entrada",
            id_producto=self.producto.id_producto,
            cantidad=5,
            id_usuario=self.usuario.id_usuario,
            observaciones="Compra",
        )
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 15)
        self.assertEqual(movimiento.tipo_movimiento, "entrada")
        self.assertEqual(Movimiento.objects.count(), 1)

    def test_registrar_salida(self):
        movimiento = MovimientoService.registrar(
            tipo_movimiento="salida",
            id_producto=self.producto.id_producto,
            cantidad=3,
            id_usuario=self.usuario.id_usuario,
            observaciones="Venta",
        )
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 7)
        self.assertEqual(movimiento.tipo_movimiento, "salida")

    def test_salida_stock_insuficiente(self):
        with self.assertRaises(serializers.ValidationError):
            MovimientoService.registrar(
                tipo_movimiento="salida",
                id_producto=self.producto.id_producto,
                cantidad=100,
                id_usuario=self.usuario.id_usuario,
                observaciones="Exceso",
            )

    def test_listar(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        Movimiento.objects.create(
            tipo_movimiento="salida", fecha=timezone.now(),
            cantidad=2, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        movimientos = MovimientoService.listar()
        self.assertEqual(movimientos.count(), 2)

    def test_listar_filtrar_tipo(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        Movimiento.objects.create(
            tipo_movimiento="salida", fecha=timezone.now(),
            cantidad=2, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        entradas = MovimientoService.listar(tipo="entrada")
        self.assertEqual(entradas.count(), 1)
        self.assertEqual(entradas.first().tipo_movimiento, "entrada")

    def test_listar_filtrar_busqueda(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        movimientos = MovimientoService.listar(busqueda="Mouse")
        self.assertEqual(movimientos.count(), 1)

    def test_listar_busqueda_sku(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        movimientos = MovimientoService.listar(busqueda="MOU123")
        self.assertEqual(movimientos.count(), 1)

    def test_historial_producto(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        Movimiento.objects.create(
            tipo_movimiento="salida", fecha=timezone.now(),
            cantidad=2, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        historial = MovimientoService.historial_producto(self.producto.id_producto)
        self.assertEqual(historial.count(), 2)
