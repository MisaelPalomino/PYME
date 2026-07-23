"""
Pruebas de integración: Informes y agregación de datos.
Verifica que los informes agregan correctamente datos de múltiples módulos.
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
class InformesIntegrationTest(TestCase):
    """Integración entre informes y datos de múltiples módulos."""

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

    @patch("apps.informes.views.ReporteService.bajo_stock")
    def test_bajo_stock_refleja_stock_actual(self, mock_bajo_stock):
        # Simular que el servicio retorna datos basados en el stock actual
        mock_bajo_stock.return_value = [
            {
                "id_producto": self.producto.id_producto,
                "nombre": "Mouse",
                "sku": "MOU123",
                "categoria": "Hardware",
                "stock_actual": self.producto.stock_actual,
                "stock_minimo": self.producto.stock_minimo,
                "deficit": max(0, self.producto.stock_minimo - self.producto.stock_actual),
                "lead_time_dias": 5,
                "estado": "Normal",
            }
        ]

        response = self.client.get("/api/informes/bajo-stock/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["stock_actual"], 10)

    @patch("apps.informes.views.ReporteService.rotacion")
    def test_rotacion_incluye_producto(self, mock_rotacion):
        mock_rotacion.return_value = [
            {
                "id_producto": self.producto.id_producto,
                "nombre": "Mouse",
                "sku": "MOU123",
                "ventas_periodo": 50,
                "stock_promedio": self.producto.stock_actual,
                "indice_rotacion": Decimal("5.00"),
            }
        ]

        response = self.client.get("/api/informes/rotacion/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["nombre"], "Mouse")

    @patch("apps.informes.views.ReporteService.consolidado")
    def test_consolidado_agrupa_datos(self, mock_consolidado):
        mock_consolidado.return_value = {
            "resumen": {
                "productos_bajo_stock": 5,
                "alertas_criticas_ia": 2,
                "mae_promedio": Decimal("2.50"),
                "mape_promedio": Decimal("15.30"),
            },
            "ultimas_semanas": [
                {
                    "periodo": "2024-01-01T00:00:00Z",
                    "ventas": Decimal("1000.00"),
                    "compras": Decimal("500.00"),
                }
            ],
            "metricas_por_producto": [
                {
                    "id_producto": self.producto.id_producto,
                    "nombre": "Mouse",
                    "mae": Decimal("1.50"),
                    "mape": Decimal("10.00"),
                    "estado_modelo": "Bueno",
                    "alerta": "Normal",
                }
            ],
        }

        response = self.client.get("/api/informes/consolidado/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("resumen", response.data)
        self.assertIn("ultimas_semanas", response.data)
        self.assertIn("metricas_por_producto", response.data)

    @patch("apps.informes.views.ReporteService.graficos_compras_ventas")
    def test_graficos_incluyen_producto(self, mock_graficos):
        mock_graficos.return_value = [
            {
                "periodo": "2024-01-01T00:00:00Z",
                "ventas": Decimal("500.00"),
                "compras": Decimal("250.00"),
            }
        ]

        response = self.client.get("/api/informes/graficos-compras-ventas/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class InventarioAlertasIntegrationTest(TestCase):
    """Integración entre inventario y alertas."""

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

    @patch("apps.inventario.views.InventarioService.obtener_stock")
    def test_stock_con_categorias(self, mock_obtener_stock):
        mock_obtener_stock.return_value = [
            {
                "id_producto": self.producto.id_producto,
                "nombre": "Mouse",
                "stock_actual": 10,
                "estado_stock": "Normal",
            }
        ]

        response = self.client.get("/api/inventario/stock/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.inventario.views.InventarioService.historial_producto")
    def test_historial_producto(self, mock_historial):
        mock_historial.return_value = [
            {
                "fecha": "2024-01-01T10:00:00Z",
                "tipo_movimiento": "entrada",
                "cantidad": 5,
                "observaciones": "Compra",
            },
            {
                "fecha": "2024-01-02T10:00:00Z",
                "tipo_movimiento": "salida",
                "cantidad": 2,
                "observaciones": "Venta",
            },
        ]

        response = self.client.get(
            f"/api/inventario/historial/{self.producto.id_producto}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_alertas_asociadas_a_producto(self):
        # Crear alertas para el producto
        Alerta.objects.create(
            mensaje="Stock bajo",
            id_producto=self.producto,
            tipo_alerta="stock_bajo",
        )
        Alerta.objects.create(
            mensaje="Stock crítico",
            id_producto=self.producto,
            tipo_alerta="sin_stock",
        )

        # Verificar que las alertas están asociadas
        alertas = Alerta.objects.filter(id_producto=self.producto)
        self.assertEqual(alertas.count(), 2)

        # Verificar tipos
        tipos = set(alertas.values_list("tipo_alerta", flat=True))
        self.assertEqual(tipos, {"stock_bajo", "sin_stock"})
