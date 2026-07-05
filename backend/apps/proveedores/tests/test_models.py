from django.test import TestCase
from ..models import Proveedor


class ProveedorModelTest(TestCase):
    def setUp(self):
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test",
            contacto="Juan Pérez",
            correo="juan@test.com",
            telefono="999999999",
            lead_time_dias=5,
        )

    def test_str(self):
        self.assertEqual(str(self.proveedor), "Proveedor Test")
