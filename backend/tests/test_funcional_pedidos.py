"""
Pruebas funcionales: Flujo completo de pedidos.
Tests: crear → enviar → recibir → verificar estados.
"""
from django.contrib.auth.hashers import make_password
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import Usuario
from apps.core.models import Categoria, Producto, Proveedor
from apps.pedidos.models import Pedido


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class PedidoFlowFunctionalTest(TestCase):
    """Flujo funcional completo de pedidos."""

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

    def _crear_pedido(self, **overrides):
        data = {
            "id_proveedor": self.proveedor.id_proveedor,
            "id_usuario": self.usuario.id_usuario,
            "observaciones": "Test",
            "detalles": [
                {
                    "id_producto": self.producto.id_producto,
                    "cantidad": 5,
                    "precio_unitario": 50,
                }
            ],
        }
        data.update(overrides)
        return self.client.post("/api/pedidos/pedidos/", data, format="json")

    def test_flujo_completo_pedido(self):
        response = self._crear_pedido()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id_pedido = response.data["id_pedido"]
        self.assertEqual(response.data["estado"], "pendiente")

        response = self.client.patch(
            f"/api/pedidos/pedidos/{id_pedido}/estado/",
            {"estado": "enviado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estado"], "enviado")

        response = self.client.post(
            f"/api/pedidos/pedidos/{id_pedido}/recibir/",
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estado"], "recibido")

    def test_crear_pedido_y_verificar_stock(self):
        response = self._crear_pedido()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pedido = Pedido.objects.get(id_pedido=response.data["id_pedido"])
        self.assertEqual(pedido.detallepedido_set.count(), 1)
        detalle = pedido.detallepedido_set.first()
        self.assertEqual(detalle.cantidad, 5)
        self.assertEqual(detalle.precio_unitario, 50)

    def test_eliminar_pedido_pendiente(self):
        response = self._crear_pedido()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id_pedido = response.data["id_pedido"]

        response = self.client.delete(f"/api/pedidos/pedidos/{id_pedido}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Pedido.objects.filter(id_pedido=id_pedido).exists())

    def test_no_eliminar_pedido_recibido(self):
        response = self._crear_pedido()
        id_pedido = response.data["id_pedido"]

        self.client.patch(
            f"/api/pedidos/pedidos/{id_pedido}/estado/",
            {"estado": "enviado"},
            format="json",
        )
        self.client.post(
            f"/api/pedidos/pedidos/{id_pedido}/recibir/",
            format="json",
        )

        response = self.client.delete(f"/api/pedidos/pedidos/{id_pedido}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Pedido.objects.filter(id_pedido=id_pedido).exists())

    def test_estado_invalido(self):
        response = self._crear_pedido()
        id_pedido = response.data["id_pedido"]

        response = self.client.patch(
            f"/api/pedidos/pedidos/{id_pedido}/estado/",
            {"estado": "cancelado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
