from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.core.models import Categoria, Producto, Proveedor
from apps.authentication.models import Usuario
from apps.movimientos.models import Movimiento


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class MovimientoListCreateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
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
        response = self.client.post(
            "/api/auth/login/",
            {"username": "user", "password": "pass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_listar(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        response = self.client.get("/api/movimientos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

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
        response = self.client.get("/api/movimientos/?tipo=entrada")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear(self):
        response = self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "entrada",
                "id_producto": self.producto.id_producto,
                "cantidad": 5,
                "observaciones": "Compra",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 15)

    def test_crear_salida(self):
        response = self.client.post(
            "/api/movimientos/",
            {
                "tipo_movimiento": "salida",
                "id_producto": self.producto.id_producto,
                "cantidad": 3,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 7)

    def test_crear_datos_invalidos(self):
        response = self.client.post(
            "/api/movimientos/",
            {"tipo_movimiento": "invalido", "id_producto": 1, "cantidad": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_historial_producto(self):
        Movimiento.objects.create(
            tipo_movimiento="entrada", fecha=timezone.now(),
            cantidad=5, observaciones="",
            id_producto=self.producto, id_usuario=self.usuario,
        )
        response = self.client.get(
            f"/api/movimientos/producto/{self.producto.id_producto}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
