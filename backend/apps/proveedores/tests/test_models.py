from django.test import TestCase
from django.db import connection, models
from ..models import Proveedor


class ProveedorModelTest(TestCase):
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
        
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test",
            contacto="Juan Pérez",
            correo="juan@test.com",
            telefono="999999999",
            lead_time_dias=5,
        )

    def tearDown(self):
        with connection.cursor() as cursor:
            cursor.execute("DROP FUNCTION IF EXISTS porcentaje_cumplimiento_proveedor(BIGINT);")
            cursor.execute("DROP FUNCTION IF EXISTS categorias_proveedor(BIGINT);")

    def test_str(self):
        """Test del método __str__"""
        self.assertEqual(str(self.proveedor), "Proveedor Test")

    def test_porcentaje_cumplimiento(self):
        """Test de la propiedad porcentaje_cumplimiento"""
        resultado = self.proveedor.porcentaje_cumplimiento
        self.assertEqual(resultado, 85.5)

    def test_categorias(self):
        """Test de la propiedad categorias"""
        categorias = self.proveedor.categorias
        self.assertIsInstance(categorias, list)
        self.assertEqual(categorias, ["Categoria1", "Categoria2"])

    def test_activo_default(self):
        """Test del valor por defecto de activo"""
        proveedor_nuevo = Proveedor.objects.create(
            nombre="Test Default",
            contacto="Contacto",
            correo="test@test.com",
            telefono="123456789",
            lead_time_dias=3,
        )
        self.assertTrue(proveedor_nuevo.activo)
        proveedor_nuevo.delete()

    def test_primary_key(self):
        """Test que verifica la clave primaria"""
        self.assertTrue(hasattr(self.proveedor, 'id_proveedor'))
        self.assertIsNotNone(self.proveedor.id_proveedor)

    def test_meta_db_table(self):
        """Test del nombre de la tabla"""
        self.assertEqual(Proveedor._meta.db_table, "proveedor")

    def test_fields_types(self):
        """Test de los tipos de campos principales"""
        self.assertIsInstance(Proveedor._meta.get_field('correo'), models.EmailField)
        self.assertIsInstance(Proveedor._meta.get_field('lead_time_dias'), models.BigIntegerField)
        self.assertIsInstance(Proveedor._meta.get_field('activo'), models.BooleanField)