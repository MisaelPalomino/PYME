from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import connection, transaction
from ..models import Categoria, Producto, Proveedor


class CategoriaViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        User = get_user_model()
        self.user = User.objects.create(
            username='testuser',
            nombre='Test User',
            email='test@test.com',
            password='testpass123',
            rol='admin',
            activo=True
        )
        self.client.force_authenticate(user=self.user)
        
        self.categoria = Categoria.objects.create(
            nombre="Electrónicos",
            descripcion="Productos electrónicos"
        )
        
        try:
            self.list_url = reverse('categorias-list')
        except:
            try:
                self.list_url = reverse('categoria-list')
            except:
                try:
                    self.list_url = reverse('core:categoria-list')
                except:
                    self.list_url = '/api/categorias/'
        
        self.detail_url = f'{self.list_url}{self.categoria.id_categoria}/'

    def test_list_categorias(self):
        """Test para listar todas las categorías"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], "Electrónicos")

    def test_retrieve_categoria(self):
        """Test para obtener una categoría específica"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], "Electrónicos")
        self.assertEqual(response.data['descripcion'], "Productos electrónicos")

    def test_retrieve_categoria_not_found(self):
        """Test para obtener una categoría que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_categoria(self):
        """Test para crear una nueva categoría"""
        data = {
            'nombre': 'Hardware',
            'descripcion': 'Componentes de hardware'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Categoria.objects.count(), 2)
        
        nueva_categoria = Categoria.objects.get(nombre='Hardware')
        self.assertEqual(nueva_categoria.descripcion, 'Componentes de hardware')

    def test_create_categoria_invalid_data(self):
        """Test para crear una categoría con datos inválidos"""
        data = {
            'nombre': '',  
            'descripcion': 'Descripción'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_categoria_missing_required_field(self):
        """Test para crear una categoría sin campo requerido"""
        data = {
            'descripcion': 'Solo descripción sin nombre'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_categoria(self):
        """Test para actualizar una categoría completamente"""
        data = {
            'nombre': 'Hardware Actualizado',
            'descripcion': 'Nueva descripción'
        }
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.categoria.refresh_from_db()
        self.assertEqual(self.categoria.nombre, 'Hardware Actualizado')
        self.assertEqual(self.categoria.descripcion, 'Nueva descripción')

    def test_update_categoria_not_found(self):
        """Test para actualizar una categoría que no existe"""
        url = f'{self.list_url}999/'
        data = {'nombre': 'Categoría Inexistente'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destroy_categoria(self):
        """Test para eliminar una categoría"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Categoria.objects.count(), 0)

    def test_destroy_categoria_not_found(self):
        """Test para eliminar una categoría que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProductoViewSetTest(TestCase):
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
        
        self.client = APIClient()
        
        User = get_user_model()
        self.user = User.objects.create(
            username='testuser',
            nombre='Test User',
            email='test@test.com',
            password='testpass123',
            rol='admin',
            activo=True
        )
        self.client.force_authenticate(user=self.user)
        
        self.categoria = Categoria.objects.create(
            nombre="Hardware",
            descripcion="Componentes de hardware"
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
            descripcion="Mouse óptico",
            stock_actual=5,
            stock_minimo=2,
            stock_maximo=10,
            precio=15.99,
            id_categoria=self.categoria,
            id_proveedor_principal=self.proveedor,
        )
        
        try:
            self.list_url = reverse('productos-list')
        except:
            try:
                self.list_url = reverse('producto-list')
            except:
                try:
                    self.list_url = reverse('core:producto-list')
                except:
                    self.list_url = '/api/productos/'
        
        self.detail_url = f'{self.list_url}{self.producto.id_producto}/'

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

    def test_list_productos(self):
        """Test para listar todos los productos"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], "Mouse")
        self.assertEqual(response.data[0]['sku'], "ABC123")

    def test_retrieve_producto(self):
        """Test para obtener un producto específico"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], "Mouse")
        self.assertEqual(response.data['sku'], "ABC123")
        self.assertEqual(float(response.data['precio']), 15.99)

    def test_retrieve_producto_not_found(self):
        """Test para obtener un producto que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_producto(self):
        """Test para crear un nuevo producto"""
        data = {
            'nombre': 'Teclado',
            'sku': 'TEC456',
            'descripcion': 'Teclado mecánico',
            'stock_actual': 3,
            'stock_minimo': 1,
            'stock_maximo': 5,
            'precio': 45.50,
            'id_categoria': self.categoria.id_categoria,
            'id_proveedor_principal': self.proveedor.id_proveedor,
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.count(), 2)
        
        nuevo_producto = Producto.objects.get(sku='TEC456')
        self.assertEqual(nuevo_producto.nombre, 'Teclado')
        self.assertEqual(float(nuevo_producto.precio), 45.50)

    def test_create_producto_invalid_data(self):
        """Test para crear un producto con datos inválidos"""
        data = {
            'nombre': '',
            'sku': '',
            'precio': -10, 
            'stock_actual': -5,  
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_producto_duplicate_sku(self):
        """Test para crear un producto con SKU duplicado"""
        data = {
            'nombre': 'Teclado',
            'sku': 'ABC123',  
            'descripcion': 'Teclado mecánico',
            'stock_actual': 3,
            'stock_minimo': 1,
            'stock_maximo': 5,
            'precio': 45.50,
            'id_categoria': self.categoria.id_categoria,
            'id_proveedor_principal': self.proveedor.id_proveedor,
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_producto(self):
        """Test para actualizar un producto completamente"""
        data = {
            'nombre': 'Mouse Gamer',
            'sku': 'ABC123',
            'descripcion': 'Mouse gamer RGB',
            'stock_actual': 8,
            'stock_minimo': 2,
            'stock_maximo': 15,
            'precio': 25.99,
            'id_categoria': self.categoria.id_categoria,
            'id_proveedor_principal': self.proveedor.id_proveedor,
        }
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, 'Mouse Gamer')
        self.assertEqual(self.producto.descripcion, 'Mouse gamer RGB')
        self.assertEqual(float(self.producto.precio), 25.99)
        self.assertEqual(self.producto.stock_actual, 8)

    def test_update_producto_not_found(self):
        """Test para actualizar un producto que no existe"""
        url = f'{self.list_url}999/'
        data = {'nombre': 'Producto Inexistente'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destroy_producto(self):
        """Test para eliminar un producto"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Producto.objects.count(), 0)

    def test_destroy_producto_not_found(self):
        """Test para eliminar un producto que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_producto_with_decimal_price(self):
        """Test para crear un producto con precio decimal"""
        data = {
            'nombre': 'Monitor',
            'sku': 'MON789',
            'descripcion': 'Monitor 24 pulgadas',
            'stock_actual': 2,
            'stock_minimo': 1,
            'stock_maximo': 5,
            'precio': 199.99,
            'id_categoria': self.categoria.id_categoria,
            'id_proveedor_principal': self.proveedor.id_proveedor,
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data['precio']), 199.99)