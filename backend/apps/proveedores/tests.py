from django.test import TestCase


from ..core.models import Proveedor
from .service import ProveedorService


class ProveedorServiceTest(TestCase):
    def test_listar_retorna_proveedores_ordenados(self):

        Proveedor.objects.create(
            nombre="Zeta",
            contacto="A",
            correo="a@test.com",
            telefono="111",
            lead_time_dias=5,
        )

        Proveedor.objects.create(
            nombre="Alpha",
            contacto="B",
            correo="b@test.com",
            telefono="222",
            lead_time_dias=3,
        )

        proveedores = list(ProveedorService.listar())

        self.assertEqual(proveedores[0].nombre, "Alpha")
        self.assertEqual(proveedores[1].nombre, "Zeta")
