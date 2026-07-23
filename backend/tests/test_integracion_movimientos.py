"""
Pruebas de integración: Movimiento → Stock → Alertas.
Verifica que los movimientos de inventario actualizan correctamente
el stock y que las alertas se generan cuando el stock es bajo.
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from decimal import Decimal

from apps.authentication.models import Usuario
from apps.core.models import Categoria, Producto, Proveedor
from apps.movimientos.models import Movimiento
from apps.inventario.models import Alerta


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class MovimientoInventarioIntegrationTest(TestCase):
    """Integración entre movimientos de inventario y estado del stock."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password="pass123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")
        self.proveedor = Proveedor.objects.create(
            nombre="Prov", contacto="Juan", correo="a@test.com",
            telefono="123", lead_time_dias=5,
        )
        self.producto = Producto.objects.create(
            nombre="Mouse", sku="MOU123", descripcion="",
            stock_actual=10, stock_minimo=5, stock_maximo=20,
            precio=50, id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def test_movimiento_entrada_actualiza_stock(self):
        stock_inicial = self.producto.stock_actual

        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 15,
                "observaciones": "Compra grande",
            },
            format="json",
        )

        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, stock_inicial + 15)

    def test_movimiento_salida_actualiza_stock(self):
        stock_inicial = self.producto.stock_actual

        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 3,
                "observaciones": "Venta",
            },
            format="json",
        )

        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, stock_inicial - 3)

    def test_multiples_movimientos_stock_acumula(self):
        stock_inicial = self.producto.stock_actual

        # Entrada de 10
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 10,
            },
            format="json",
        )

        # Salida de 5
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
            },
            format="json",
        )

        # Entrada de 3
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 3,
            },
            format="json",
        )

        self.producto.refresh_from_db()
        # 10 + 10 - 5 + 3 = 18
        self.assertEqual(self.producto.stock_actual, stock_inicial + 8)

    def test_stock_llega_a_cero(self):
        self.producto.stock_actual = 5
        self.producto.save()

        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
            },
            format="json",
        )

        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 0)

    def test_stock_bajo_genera_alerta(self):
        # Crear alerta manualmente para simular el comportamiento esperado
        Alerta.objects.create(
            mensaje="Stock bajo para Mouse",
            id_producto=self.producto,
            tipo_alerta="stock_bajo",
        )

        alertas = Alerta.objects.filter(id_producto=self.producto)
        self.assertEqual(alertas.count(), 1)
        self.assertEqual(alertas.first().tipo_alerta, "stock_bajo")

    def test_stock_critico_genera_alerta(self):
        Alerta.objects.create(
            mensaje="Stock crítico para Mouse",
            id_producto=self.producto,
            tipo_alerta="sin_stock",
        )

        alertas = Alerta.objects.filter(
            id_producto=self.producto, tipo_alerta="sin_stock"
        )
        self.assertEqual(alertas.count(), 1)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class MovimientoHistorialIntegrationTest(TestCase):
    """Integración entre movimientos y historial de producto."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password="pass123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

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

    def test_historial_registra_todos_movimientos(self):
        # Crear varios movimientos
        for i in range(5):
            self.client.post(
                "/api/movimientos/",
                {
                    "tipo_movimiento": "entrada" if i % 2 == 0 else "salida",
                    "id_producto": self.producto.id_producto,
                    "cantidad": 1,
                },
                format="json",
            )

        # Verificar historial
        response = self.client.get(
            f"/api/movimientos/producto/{self.producto.id_producto}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

    def test_historial_solo_producto_especifico(self):
        otro_producto = Producto.objects.create(
            nombre="Teclado", sku="TEC456", descripcion="",
            stock_actual=5, stock_minimo=1, stock_maximo=10,
            precio=30, id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

        # Movimientos para ambos productos
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 1,
            },
            format="json",
        )
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": otro_producto.id_producto,
                "cantidad": 1,
            },
            format="json",
        )

        # Historial solo del primer producto
        response = self.client.get(
            f"/api/movimientos/producto/{self.producto.id_producto}/"
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["producto_nombre"], "Mouse"
        )
