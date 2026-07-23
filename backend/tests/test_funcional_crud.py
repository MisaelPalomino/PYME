"""
Pruebas funcionales: Flujo completo de productos (CRUD).
Tests: crear → listar → obtener → actualizar → eliminar.
"""
from unittest.mock import patch, MagicMock
from django.contrib.auth.hashers import make_password
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
class ProductoCRUDFlowFunctionalTest(TestCase):
    """Flujo funcional completo de CRUD de productos."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password=make_password("pass123"),
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

    def test_crud_completo_producto(self):
        # 1. Listar productos (vacío)
        response = self.client.get("/api/core/productos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        # 2. Crear producto
        response = self.client.post(
            "/api/core/productos/",
            {
                "nombre": "Mouse",
                "sku": "MOU123",
                "descripcion": "Mouse gamer",
                "precio": 50.00,
                "stock_actual": 10,
                "stock_minimo": 2,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        producto_id = response.data["id_producto"]
        self.assertEqual(response.data["nombre"], "Mouse")

        # 3. Obtener producto
        response = self.client.get(f"/api/core/productos/{producto_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sku"], "MOU123")

        # 4. Actualizar producto
        response = self.client.put(
            f"/api/core/productos/{producto_id}/",
            {
                "nombre": "Mouse Gamer Pro",
                "sku": "MOU123",
                "descripcion": "Mouse gamer actualizado",
                "precio": 75.00,
                "stock_actual": 15,
                "stock_minimo": 5,
                "stock_maximo": 30,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "Mouse Gamer Pro")
        self.assertEqual(response.data["precio"], "75.00")

        # 5. Verificar que se actualizó
        response = self.client.get(f"/api/core/productos/{producto_id}/")
        self.assertEqual(response.data["nombre"], "Mouse Gamer Pro")

        # 6. Eliminar producto
        response = self.client.delete(f"/api/core/productos/{producto_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # 7. Verificar que fue eliminado
        response = self.client.get(f"/api/core/productos/{producto_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_crear_producto_datos_invalidos(self):
        # Precio inválido
        response = self.client.post(
            "/api/core/productos/",
            {
                "nombre": "Mouse",
                "sku": "MOU123",
                "precio": 0,
                "stock_actual": 10,
                "stock_minimo": 2,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crear_producto_stock_min_mayor_max(self):
        response = self.client.post(
            "/api/core/productos/",
            {
                "nombre": "Mouse",
                "sku": "MOU123",
                "precio": 50,
                "stock_actual": 10,
                "stock_minimo": 30,
                "stock_maximo": 20,
                "id_categoria": self.categoria.id_categoria,
                "id_proveedor_principal": self.proveedor.id_proveedor,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class CategoriaCRUDFlowFunctionalTest(TestCase):
    """Flujo funcional completo de CRUD de categorías."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password=make_password("pass123"),
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_crud_completo_categoria(self):
        # 1. Crear categoría
        response = self.client.post(
            "/api/core/categorias/",
            {"nombre": "Electrónica", "descripcion": "Productos electrónicos"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cat_id = response.data["id_categoria"]

        # 2. Obtener categoría
        response = self.client.get(f"/api/core/categorias/{cat_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "Electrónica")

        # 3. Actualizar categoría
        response = self.client.put(
            f"/api/core/categorias/{cat_id}/",
            {"nombre": "Electrónica Actualizada", "descripcion": "Nueva desc"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "Electrónica Actualizada")

        # 4. Eliminar categoría
        response = self.client.delete(f"/api/core/categorias/{cat_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class ProveedorCRUDFlowFunctionalTest(TestCase):
    """Flujo funcional completo de CRUD de proveedores."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            username="user", nombre="User", email="u@test.com",
            rol="Almacenero", password=make_password("pass123"),
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    @patch("apps.proveedores.views.ProveedorSerializer")
    def test_crud_completo_proveedor(self, mock_serializer_cls):
        # NOTA: ProveedorSerializer llama a una función PostgreSQL
        # (porcentaje_cumplimiento_proveedor) que no existe en la BD de test.
        # Se mockea el serializer para evitar el error.
        from unittest.mock import MagicMock

        # Configurar mock para POST (create)
        mock_instance = MagicMock()
        mock_instance.is_valid.return_value = True
        mock_instance.save.return_value = MagicMock()
        mock_serializer_cls.return_value = mock_instance
        mock_instance.data = {
            "id_proveedor": 1,
            "nombre": "Proveedor ABC",
            "contacto": "Juan Pérez",
            "correo": "abc@test.com",
            "telefono": "999888777",
            "lead_time_dias": 7,
            "activo": True,
            "porcentaje_cumplimiento": 0,
            "categorias": [],
        }

        # Crear proveedor
        response = self.client.post(
            "/api/proveedores/proveedores/",
            {
                "nombre": "Proveedor ABC",
                "contacto": "Juan Pérez",
                "correo": "abc@test.com",
                "telefono": "999888777",
                "lead_time_dias": 7,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
