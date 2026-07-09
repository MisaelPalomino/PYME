from django.test import TestCase
from django.db import connection
from django.db import models
from django.db import transaction
from ..models import Categoria, Producto, Proveedor


class CategoriaModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nombre="Electrónicos",
            descripcion="Productos electrónicos y tecnológicos"
        )

    def tearDown(self):
        try:
            transaction.rollback()
        except:
            pass

    def test_str(self):
        """Test del método __str__ de Categoria"""
        self.assertEqual(str(self.categoria), "Electrónicos")

    def test_categoria_creation(self):
        """Test que verifica la creación correcta de una categoría"""
        self.assertEqual(self.categoria.nombre, "Electrónicos")
        self.assertEqual(self.categoria.descripcion, "Productos electrónicos y tecnológicos")
        self.assertIsNotNone(self.categoria.id_categoria)

    def test_db_table_name(self):
        """Test que verifica el nombre correcto de la tabla"""
        self.assertEqual(Categoria._meta.db_table, "categoria")

    def test_primary_key_field(self):
        """Test que verifica que id_categoria sea la clave primaria"""
        self.assertTrue(Categoria._meta.get_field('id_categoria').primary_key)
        self.assertIsInstance(Categoria._meta.get_field('id_categoria'), models.BigAutoField)

    def test_field_max_length(self):
        """Test que verifica la longitud máxima del campo nombre"""
        nombre_field = Categoria._meta.get_field('nombre')
        self.assertEqual(nombre_field.max_length, 255)

    def test_descripcion_field_type(self):
        """Test que verifica el tipo de campo descripcion"""
        descripcion_field = Categoria._meta.get_field('descripcion')
        self.assertIsInstance(descripcion_field, models.TextField)

    def test_categoria_with_empty_description(self):
        """Test que verifica que se puede crear una categoría sin descripción"""
        categoria_vacia = Categoria.objects.create(
            nombre="Test",
            descripcion=""
        )
        self.assertEqual(categoria_vacia.descripcion, "")
        categoria_vacia.delete()

    def test_categoria_update(self):
        """Test que verifica la actualización de una categoría"""
        self.categoria.nombre = "Nueva Categoría"
        self.categoria.descripcion = "Nueva descripción"
        self.categoria.save()
        
        self.categoria.refresh_from_db()
        self.assertEqual(self.categoria.nombre, "Nueva Categoría")
        self.assertEqual(self.categoria.descripcion, "Nueva descripción")


class ProductoModelTest(TestCase):
    def setUp(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE OR REPLACE FUNCTION porcentaje_cumplimiento_proveedor(p_id BIGINT)
                RETURNS NUMERIC AS $$
                BEGIN
                    RETURN 85.5;
                END;
                $$ LANGUAGE plpgsql;
            """)
            
            cursor.execute("""
                CREATE OR REPLACE FUNCTION categorias_proveedor(p_id BIGINT)
                RETURNS TEXT AS $$
                BEGIN
                    RETURN '["Categoria1", "Categoria2"]';
                END;
                $$ LANGUAGE plpgsql;
            """)
        
        self.categoria = Categoria.objects.create(
            nombre="Hardware",
            descripcion="Componentes y accesorios de hardware"
        )
        
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test",
            contacto="Juan Pérez",
            correo="juan@test.com",
            telefono="999999999",
            lead_time_dias=5,
        )
        
        self.producto = Producto.objects.create(
            nombre="Mouse",
            sku="ABC123",
            descripcion="Mouse óptico inalámbrico",
            stock_actual=5,
            stock_minimo=2,
            stock_maximo=10,
            precio=15.99,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )

    def tearDown(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("DROP FUNCTION IF EXISTS porcentaje_cumplimiento_proveedor(BIGINT);")
                cursor.execute("DROP FUNCTION IF EXISTS categorias_proveedor(BIGINT);")
        except:
            pass
        
        try:
            transaction.rollback()
        except:
            pass

    def test_str(self):
        """Test del método __str__ de Producto"""
        self.assertEqual(str(self.producto), "Mouse (ABC123)")

    def test_producto_creation(self):
        """Test que verifica la creación correcta de un producto"""
        self.assertEqual(self.producto.nombre, "Mouse")
        self.assertEqual(self.producto.sku, "ABC123")
        self.assertEqual(self.producto.descripcion, "Mouse óptico inalámbrico")
        self.assertEqual(self.producto.stock_actual, 5)
        self.assertEqual(self.producto.stock_minimo, 2)
        self.assertEqual(self.producto.stock_maximo, 10)
        self.assertEqual(float(self.producto.precio), 15.99)
        self.assertEqual(self.producto.id_categoria, self.categoria)
        self.assertEqual(self.producto.id_proveedor_principal, self.proveedor)
        self.assertIsNotNone(self.producto.id_producto)

    def test_db_table_name(self):
        """Test que verifica el nombre correcto de la tabla"""
        self.assertEqual(Producto._meta.db_table, "producto")

    def test_primary_key_field(self):
        """Test que verifica que id_producto sea la clave primaria"""
        self.assertTrue(Producto._meta.get_field('id_producto').primary_key)
        self.assertIsInstance(Producto._meta.get_field('id_producto'), models.BigAutoField)

    def test_sku_unique(self):
        """Test que verifica que SKU sea único"""
        with self.assertRaises(Exception):
            with transaction.atomic():
                Producto.objects.create(
                    nombre="Teclado",
                    sku="ABC123",  
                    descripcion="Teclado mecánico",
                    stock_actual=3,
                    stock_minimo=1,
                    stock_maximo=5,
                    precio=45.50,
                    id_categoria=self.categoria,
                    id_proveedor_principal=self.proveedor,
                )

    def test_field_max_lengths(self):
        """Test que verifica las longitudes máximas de los campos"""
        nombre_field = Producto._meta.get_field('nombre')
        sku_field = Producto._meta.get_field('sku')
        
        self.assertEqual(nombre_field.max_length, 255)
        self.assertEqual(sku_field.max_length, 255)

    def test_precision_and_scale(self):
        """Test que verifica la precisión y escala del campo precio"""
        precio_field = Producto._meta.get_field('precio')
        self.assertEqual(precio_field.max_digits, 10)
        self.assertEqual(precio_field.decimal_places, 2)

    def test_foreign_key_relations(self):
        """Test que verifica las relaciones ForeignKey"""
        categoria_field = Producto._meta.get_field('id_categoria')
        proveedor_field = Producto._meta.get_field('id_proveedor_principal')
        
        self.assertEqual(categoria_field.remote_field.model, Categoria)
        self.assertEqual(proveedor_field.remote_field.model, Proveedor)
        self.assertEqual(categoria_field.db_column, "id_categoria")
        self.assertEqual(proveedor_field.db_column, "id_proveedor_principal")

    def test_on_delete_protect(self):
        """Test que verifica que on_delete=PROTECT funcione"""
        with self.assertRaises(Exception):
            self.categoria.delete()
        
        with self.assertRaises(Exception):
            self.proveedor.delete()

    def test_stock_fields_type(self):
        """Test que verifica los tipos de campos de stock"""
        stock_actual_field = Producto._meta.get_field('stock_actual')
        stock_minimo_field = Producto._meta.get_field('stock_minimo')
        stock_maximo_field = Producto._meta.get_field('stock_maximo')
        
        self.assertIsInstance(stock_actual_field, models.BigIntegerField)
        self.assertIsInstance(stock_minimo_field, models.BigIntegerField)
        self.assertIsInstance(stock_maximo_field, models.BigIntegerField)

    def test_producto_update(self):
        """Test que verifica la actualización de un producto"""
        self.producto.nombre = "Mouse Gamer"
        self.producto.precio = 25.99
        self.producto.stock_actual = 8
        self.producto.save()
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, "Mouse Gamer")
        self.assertEqual(float(self.producto.precio), 25.99)
        self.assertEqual(self.producto.stock_actual, 8)

    def test_multiple_products(self):
        """Test que verifica la creación de múltiples productos"""
        producto2 = Producto.objects.create(
            nombre="Teclado",
            sku="TEC456",
            descripcion="Teclado mecánico RGB",
            stock_actual=3,
            stock_minimo=1,
            stock_maximo=5,
            precio=45.50,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )
        
        count = Producto.objects.count()
        self.assertEqual(count, 2)
        
        producto2.delete()

    def test_producto_with_zero_stock(self):
        """Test que verifica que se puede crear un producto con stock 0"""
        producto_zero = Producto.objects.create(
            nombre="Producto Agotado",
            sku="AGOT001",
            descripcion="Producto sin stock",
            stock_actual=0,
            stock_minimo=1,
            stock_maximo=10,
            precio=10.00,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )
        self.assertEqual(producto_zero.stock_actual, 0)
        producto_zero.delete()

    def test_producto_with_decimal_price(self):
        """Test que verifica que el precio maneja decimales correctamente"""
        producto_decimal = Producto.objects.create(
            nombre="Producto Decimal",
            sku="DEC001",
            descripcion="Producto con precio decimal",
            stock_actual=5,
            stock_minimo=1,
            stock_maximo=10,
            precio=19.99,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )
        self.assertEqual(float(producto_decimal.precio), 19.99)
        producto_decimal.delete()