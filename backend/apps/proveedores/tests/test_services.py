from django.test import TestCase
from django.http import Http404

from ..models import Proveedor
from ..service import ProveedorService
from ..serializer import ProveedorSerializer


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

    def test_obtener_existente(self):

        proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=4,
        )

        obtenido = ProveedorService.obtener(proveedor.pk)

        self.assertEqual(obtenido.pk, proveedor.pk)

    def test_obtener_inexistente(self):

        with self.assertRaises(Http404):
            ProveedorService.obtener(999)

    def test_crear(self):

        serializer = ProveedorSerializer(
            data={
                "nombre": "Proveedor",
                "contacto": "Juan",
                "correo": "a@test.com",
                "telefono": "123",
                "lead_time_dias": 10,
            }
        )

        serializer.is_valid(raise_exception=True)

        proveedor = ProveedorService.crear(serializer)

        self.assertEqual(Proveedor.objects.count(), 1)

        self.assertEqual(proveedor.nombre, "Proveedor")

    def test_actualizar(self):

        proveedor = Proveedor.objects.create(
            nombre="Viejo",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=3,
        )

        serializer = ProveedorSerializer(
            data={
                "nombre": "Nuevo",
                "contacto": "Juan",
                "correo": "a@test.com",
                "telefono": "123",
                "lead_time_dias": 8,
            }
        )

        serializer.is_valid(raise_exception=True)

        actualizado = ProveedorService.actualizar(proveedor.pk, serializer)

        self.assertEqual(actualizado.nombre, "Nuevo")
        self.assertEqual(actualizado.lead_time_dias, 8)

    def test_eliminar(self):

        proveedor = Proveedor.objects.create(
            nombre="Proveedor",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=3,
        )

        ProveedorService.eliminar(proveedor.pk)

        self.assertEqual(Proveedor.objects.count(), 0)

    def test_eliminar_inexistente(self):

        with self.assertRaises(Http404):
            ProveedorService.eliminar(1000)
