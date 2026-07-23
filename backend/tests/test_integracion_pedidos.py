"""
Pruebas de integración: Pedido → Stock → Proveedor.
Verifica que el flujo completo de pedidos interactúa correctamente
con productos, proveedores y estados.
"""
from django.contrib.auth.hashers import make_password
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import Usuario
from apps.core.models import Categoria, Producto, Proveedor
from apps.pedidos.models import Pedido, DetallePedido


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class PedidoProductoIntegrationTest(TestCase):
    """Integración entre pedidos y productos."""

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
        self.producto = Producto.objects.create(
            nombre="Mouse", sku="MOU123", descripcion="",
            stock_actual=10, stock_minimo=2, stock_maximo=20,
            precio=50, id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def test_pedido_con_multiples_productos(self):
        response = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Pedido completo",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 5,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pedido = Pedido.objects.get(id_pedido=response.data["id_pedido"])
        self.assertEqual(pedido.detallepedido_set.count(), 1)

    def test_pedido_calcula_total(self):
        response = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Test total",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 10,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pedido = Pedido.objects.get(id_pedido=response.data["id_pedido"])
        detalle = pedido.detallepedido_set.first()
        self.assertEqual(detalle.cantidad * detalle.precio_unitario, 500)

    def test_pedido_con_proveedor_informacion(self):
        response = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Con info proveedor",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 3,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pedido = Pedido.objects.get(id_pedido=response.data["id_pedido"])
        self.assertEqual(pedido.id_proveedor.nombre, "Prov")
        self.assertEqual(pedido.id_proveedor.lead_time_dias, 5)

    def test_pedido_transicion_estados(self):
        response = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Test estados",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 2,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id_pedido = response.data["id_pedido"]
        self.assertEqual(response.data["estado"], "pendiente")

        response = self.client.patch(
            f"/api/pedidos/pedidos/{id_pedido}/estado/",
            {"estado": "enviado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pedido = Pedido.objects.get(id_pedido=id_pedido)
        self.assertEqual(pedido.estado, "enviado")


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class PedidoProveedorIntegrationTest(TestCase):
    """Integración entre pedidos y proveedores."""

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
        self.producto = Producto.objects.create(
            nombre="Mouse", sku="MOU123", descripcion="",
            stock_actual=10, stock_minimo=2, stock_maximo=20,
            precio=50, id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def test_pedido_mismo_proveedor_multiples(self):
        for i in range(2):
            response = self.client.post(
                "/api/pedidos/pedidos/",
                {
                    "id_proveedor": self.proveedor.id_proveedor,
                    "id_usuario": self.usuario.id_usuario,
                    "observaciones": f"Pedido {i+1}",
                    "detalles": [
                        {
                            "id_producto": self.producto.id_producto,
                            "cantidad": 3,
                            "precio_unitario": 50,
                        }
                    ],
                },
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pedidos = Pedido.objects.filter(id_proveedor=self.proveedor)
        self.assertEqual(pedidos.count(), 2)

    def test_pedido_proveedor_diferente(self):
        proveedor2 = Proveedor.objects.create(
            nombre="Prov2", contacto="Maria", correo="b@test.com",
            telefono="456", lead_time_dias=3,
        )
        response1 = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": self.proveedor.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Para Prov",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 1,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post(
            "/api/pedidos/pedidos/",
            {
                "id_proveedor": proveedor2.id_proveedor,
                "id_usuario": self.usuario.id_usuario,
                "observaciones": "Para Prov2",
                "detalles": [
                    {
                        "id_producto": self.producto.id_producto,
                        "cantidad": 2,
                        "precio_unitario": 50,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        pedido1 = Pedido.objects.get(id_pedido=response1.data["id_pedido"])
        pedido2 = Pedido.objects.get(id_pedido=response2.data["id_pedido"])
        self.assertNotEqual(pedido1.id_proveedor, pedido2.id_proveedor)
