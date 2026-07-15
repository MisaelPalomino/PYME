from django.test import TestCase


from unittest.mock import  MagicMock


from ..models import Proveedor
from ..serializer import ProveedorSerializer


class ProveedorSerializerTest(TestCase):
    def test_proveedor_valido(self):

        serializer = ProveedorSerializer(
            data={
                "nombre": "Proveedor X",
                "contacto": "Juan",
                "correo": "juan@test.com",
                "telefono": "999999",
                "lead_time_dias": 5,
                "activo": True,
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_lead_time_negativo(self):

        serializer = ProveedorSerializer(
            data={
                "nombre": "Proveedor X",
                "contacto": "Juan",
                "correo": "juan@test.com",
                "telefono": "999999",
                "lead_time_dias": -1,
                "activo": True,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("lead_time_dias", serializer.errors)

    from unittest.mock import PropertyMock, patch

    @patch("apps.proveedores.models.connection.cursor")
    def test_porcentaje_cumplimiento(self, mock_cursor):

        cursor = MagicMock()
        mock_cursor.return_value.__enter__.return_value = cursor

        cursor.fetchone.return_value = (95.5,)

        proveedor = Proveedor(id_proveedor=7)

        self.assertEqual(proveedor.porcentaje_cumplimiento, 95.5)

    @patch.object(Proveedor, "categorias", new_callable=PropertyMock)
    def test_get_categorias(self, mock_prop):

        mock_prop.return_value = ["A", "B"]

        proveedor = Proveedor()

        serializer = ProveedorSerializer(proveedor)

        self.assertEqual(serializer.get_categorias(proveedor), ["A", "B"])
