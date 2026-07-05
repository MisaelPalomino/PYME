from django.test import TestCase

from apps.core.models import Categoria, Producto, Proveedor
from apps.core.service import CategoriaService, ProductoService
from apps.core.serializer import ProductoSerializer


class CategoriaServiceTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="Desc")
        self.proveedor = Proveedor.objects.create(
            nombre="Prov",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.cat1 = Categoria.objects.create(nombre="A", descripcion="")

        self.cat2 = Categoria.objects.create(nombre="B", descripcion="")

    def test_listar_con_count(self):

        categorias = CategoriaService.listar()

        for cat in categorias:
            self.assertTrue(hasattr(cat, "productos_count"))

    def test_obtener(self):

        categoria = CategoriaService.obtener(self.cat1.id_categoria)

        self.assertEqual(categoria.id_categoria, self.cat1.id_categoria)
        self.assertTrue(hasattr(categoria, "productos_count"))

    def test_crear(self):
        data = {
            "nombre": "Teclado",
            "sku": "TEC123",
            "descripcion": "Teclado mecánico",  # <-- antes estaba "" o ausente, ahora con contenido
            "stock_actual": 5,
            "stock_minimo": 1,
            "stock_maximo": 10,
            "precio": 30,
            "id_categoria": self.categoria.id_categoria,
            "id_proveedor_principal": self.proveedor.id_proveedor,
        }
        serializer = ProductoSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        producto = ProductoService.crear(serializer)
        self.assertEqual(Producto.objects.count(), 1)
        self.assertEqual(producto.nombre, "Teclado")

    def test_actualizar(self):

        class FakeSerializer:
            def save(self):
                self.instance.nombre = "Actualizada"
                self.instance.save()
                return self.instance

        serializer = FakeSerializer()
        serializer.instance = self.cat1

        categoria = CategoriaService.actualizar(serializer)

        self.cat1.refresh_from_db()

        self.assertEqual(self.cat1.nombre, "Actualizada")

    def test_eliminar(self):

        CategoriaService.eliminar(self.cat1)

        self.assertFalse(
            Categoria.objects.filter(id_categoria=self.cat1.id_categoria).exists()
        )


class ProductoServiceTest(TestCase):
    def setUp(self):

        self.categoria = Categoria.objects.create(nombre="Hardware", descripcion="")

        self.proveedor = Proveedor.objects.create(
            nombre="Prov",
            contacto="Juan",
            correo="a@test.com",
            telefono="123",
            lead_time_dias=5,
        )

        self.producto = Producto.objects.create(
            nombre="Mouse",
            sku="MOU123",
            descripcion="",
            stock_actual=10,
            stock_minimo=2,
            stock_maximo=20,
            precio=50,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def test_listar(self):

        productos = ProductoService.listar()

        self.assertTrue(hasattr(productos.first(), "id_categoria"))

    def test_obtener(self):

        producto = ProductoService.obtener(self.producto.id_producto)

        self.assertEqual(producto.id_producto, self.producto.id_producto)

    def test_crear(self):

        class FakeSerializer:
            def __init__(self, categoria, proveedor):
                self.categoria = categoria
                self.proveedor = proveedor

            def save(self):
                return Producto.objects.create(
                    nombre="Teclado",
                    sku="TEC123",
                    descripcion="",
                    stock_actual=5,
                    stock_minimo=1,
                    stock_maximo=10,
                    precio=30,
                    id_categoria=self.categoria,
                    id_proveedor_principal=self.proveedor,
                )

        serializer = FakeSerializer(self.categoria, self.proveedor)

        producto = ProductoService.crear(serializer)
        self.assertEqual(Producto.objects.count(), 2)
        self.assertEqual(producto.nombre, "Teclado")

    def test_actualizar(self):

        class FakeSerializer:
            def save(self):
                self.instance.precio = 99
                self.instance.save()
                return self.instance

        serializer = FakeSerializer()
        serializer.instance = self.producto

        producto = ProductoService.actualizar(serializer)

        self.producto.refresh_from_db()

        self.assertEqual(self.producto.precio, 99)

    def test_eliminar(self):

        ProductoService.eliminar(self.producto)

        self.assertFalse(
            Producto.objects.filter(id_producto=self.producto.id_producto).exists()
        )
