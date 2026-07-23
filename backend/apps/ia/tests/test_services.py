from django.test import TestCase
from unittest.mock import patch, MagicMock
from decimal import Decimal
from django.shortcuts import get_object_or_404

from apps.core.models import Categoria, Producto, Proveedor
from apps.ia.models import Prediccion
from apps.ia.service import IAService


class IAServiceTest(TestCase):
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

    @patch("apps.ia.service.IACalculations")
    def test_generar_prediccion_producto(self, mock_ia):
        mock_model = MagicMock()
        mock_ia.entrenar_modelo.return_value = (mock_model, 2.5, 15.3, 50)
        mock_ia.predecir_demanda.return_value = Decimal("15.50")

        result = IAService.generar_prediccion_producto(self.producto.id_producto)

        self.assertEqual(result["estado"], "entrenado")
        self.assertEqual(result["n_muestras"], 50)
        self.assertEqual(len(result["predicciones"]), 3)
        self.assertEqual(Prediccion.objects.count(), 3)

    @patch("apps.ia.service.IACalculations")
    def test_generar_prediccion_sin_datos(self, mock_ia):
        mock_ia.entrenar_modelo.return_value = (None, 0, 0, 0)

        result = IAService.generar_prediccion_producto(self.producto.id_producto)

        self.assertEqual(result["estado"], "sin_datos")
        self.assertEqual(Prediccion.objects.count(), 0)

    @patch("apps.ia.service.IACalculations")
    def test_generar_prediccion_pocas_muestras(self, mock_ia):
        mock_ia.entrenar_modelo.return_value = (None, 0, 0, 1)

        result = IAService.generar_prediccion_producto(self.producto.id_producto)

        self.assertEqual(result["estado"], "sin_datos")

    def test_obtener_ultima_prediccion(self):
        Prediccion.objects.create(
            id_producto=self.producto, horizonte_dias=7, demanda_predicha=Decimal("15.50")
        )
        result = IAService.obtener_ultima_prediccion(self.producto.id_producto, 7)
        self.assertEqual(result["demanda_predicha"], Decimal("15.50"))

    def test_obtener_ultima_prediccion_no_existe(self):
        result = IAService.obtener_ultima_prediccion(self.producto.id_producto, 7)
        self.assertIsNone(result["demanda_predicha"])

    def test_listar_predicciones_producto(self):
        Prediccion.objects.create(
            id_producto=self.producto, horizonte_dias=7, demanda_predicha=Decimal("15.50")
        )
        Prediccion.objects.create(
            id_producto=self.producto, horizonte_dias=14, demanda_predicha=Decimal("25.00")
        )
        result = IAService.listar_predicciones_producto(self.producto.id_producto)
        self.assertEqual(len(result), 2)

    def test_listar_productos_con_predicciones(self):
        Prediccion.objects.create(
            id_producto=self.producto, horizonte_dias=7, demanda_predicha=Decimal("15.50")
        )
        result = IAService.listar_productos_con_predicciones()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["prediccion_7d"], Decimal("15.50"))
        self.assertIsNone(result[0]["prediccion_14d"])

    @patch("apps.ia.service.IACalculations")
    def test_generar_todas_predicciones(self, mock_ia):
        mock_model = MagicMock()
        mock_ia.entrenar_modelo.return_value = (mock_model, 2.5, 15.3, 50)
        mock_ia.predecir_demanda.return_value = Decimal("15.50")

        result = IAService.generar_todas_predicciones()

        self.assertEqual(result["total_productos"], 1)
        self.assertEqual(result["procesados"], 1)

    def test_producto_inexistente(self):
        from django.http import Http404
        with self.assertRaises(Http404):
            IAService.generar_prediccion_producto(9999)
