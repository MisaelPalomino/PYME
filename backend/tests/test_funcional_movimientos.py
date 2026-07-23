"""
Pruebas funcionales: Flujo completo de movimientos de inventario.
Tests: entrada → salida → verificar stock → historial.
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import Usuario
from apps.core.models import Categoria, Producto, Proveedor


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class MovimientoFlowFunctionalTest(TestCase):
    """Flujo funcional completo de movimientos de inventario."""

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

    def test_flujo_completo_entrada_salida(self):
        stock_inicial = self.producto.stock_actual

        # 1. Registrar entrada
        response = self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 10,
                "observaciones": "Compra a proveedor",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, stock_inicial + 10)

        # 2. Registrar salida
        response = self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
                "observaciones": "Venta a cliente",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, stock_inicial + 5)

        # 3. Verificar historial
        response = self.client.get(
            f"/api/movimientos/producto/{self.producto.id_producto}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # 4. Verificar que el historial está ordenado (más reciente primero)
        self.assertEqual(response.data[0]["tipo_movimiento"], "entrada")
        self.assertEqual(response.data[1]["tipo_movimiento"], "salida")

    def test_salida_stock_insuficiente(self):
        stock_inicial = self.producto.stock_actual

        # Intentar sacar más de lo que hay
        response = self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 100,
                "observaciones": "Exceso",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Verificar que el stock no cambió
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, stock_inicial)

    def test_listar_filtrar_por_tipo(self):
        # Crear movimientos de ambos tipos
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
            },
            format="json",
        )
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 2,
            },
            format="json",
        )

        # Filtrar por entrada
        response = self.client.get("/api/movimientos/?tipo=entrada")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["tipo_movimiento"], "entrada")

        # Filtrar por salida
        response = self.client.get("/api/movimientos/?tipo=salida")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["tipo_movimiento"], "salida")

    def test_listar_filtrar_por_busqueda(self):
        # Crear movimiento
        self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
            },
            format="json",
        )

        # Buscar por nombre
        response = self.client.get("/api/movimientos/?busqueda=Mouse")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Buscar por SKU
        response = self.client.get("/api/movimientos/?busqueda=MOU123")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Buscar inexistente
        response = self.client.get("/api/movimientos/?busqueda=XYZ")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
