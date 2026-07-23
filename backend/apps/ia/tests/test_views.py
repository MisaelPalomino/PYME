from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from decimal import Decimal

from apps.core.models import Categoria, Producto, Proveedor
from apps.ia.models import Prediccion


@override_settings(REST_FRAMEWORK={
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
})
class IAPrediccionViewSetTest(TestCase):
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

    @patch("apps.ia.views.IAService")
    def test_list(self, mock_service):
        mock_service.listar_productos_con_predicciones.return_value = [
            {
                "producto_id": 1,
                "producto_nombre": "Mouse",
                "sku": "MOU123",
                "stock_actual": 10,
                "prediccion_7d": Decimal("15.50"),
                "prediccion_14d": None,
                "prediccion_21d": None,
            }
        ]
        response = self.client.get("/api/ia/predicciones/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.ia.views.IAService")
    def test_listar_predicciones(self, mock_service):
        mock_service.listar_predicciones_producto.return_value = [
            {"id_prediccion": 1, "dias": 7, "demanda_predicha": Decimal("15.50")}
        ]
        response = self.client.get(
            f"/api/ia/predicciones/{self.producto.id_producto}/predicciones/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.ia.views.IAService")
    def test_obtener_prediccion(self, mock_service):
        mock_service.obtener_ultima_prediccion.return_value = {
            "producto_id": 1,
            "producto_nombre": "Mouse",
            "dias": 7,
            "demanda_predicha": Decimal("15.50"),
        }
        response = self.client.get(
            f"/api/ia/predicciones/{self.producto.id_producto}/prediccion/7/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_obtener_prediccion_dias_invalidos(self):
        response = self.client.get(
            f"/api/ia/predicciones/{self.producto.id_producto}/prediccion/10/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.ia.views.IAService")
    def test_generar_prediccion(self, mock_service):
        mock_service.generar_prediccion_producto.return_value = {
            "producto_id": 1,
            "producto_nombre": "Mouse",
            "estado": "entrenado",
        }
        response = self.client.post(
            f"/api/ia/predicciones/{self.producto.id_producto}/generar/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.ia.views.IAService")
    def test_generar_todos(self, mock_service):
        mock_service.generar_todas_predicciones.return_value = {
            "total_productos": 1,
            "procesados": 1,
            "resultados": [],
        }
        response = self.client.post("/api/ia/predicciones/generar-todos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
