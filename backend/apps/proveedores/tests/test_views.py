from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import connection
from ..models import Proveedor


class ProveedorViewSetTest(TestCase):
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
        
        self.proveedor = Proveedor.objects.create(
            nombre="Proveedor Test",
            contacto="Juan Pérez",
            correo="juan@test.com",
            telefono="999999999",
            lead_time_dias=5,
        )
        
        try:
            self.list_url = reverse('proveedores-list')
        except:
            try:
                self.list_url = reverse('proveedor-list')
            except:
                try:
                    self.list_url = reverse('proveedores:proveedor-list')
                except:
                    self.list_url = '/api/proveedores/'
        
        self.detail_url = f'{self.list_url}{self.proveedor.id_proveedor}/'

    def tearDown(self):
        with connection.cursor() as cursor:
            cursor.execute("DROP FUNCTION IF EXISTS porcentaje_cumplimiento_proveedor(BIGINT);")
            cursor.execute("DROP FUNCTION IF EXISTS categorias_proveedor(BIGINT);")

    def test_list_proveedores(self):
        """Test para listar todos los proveedores"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_proveedor(self):
        """Test para obtener un proveedor específico"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], "Proveedor Test")

    def test_retrieve_proveedor_not_found(self):
        """Test para obtener un proveedor que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_proveedor(self):
        """Test para crear un nuevo proveedor"""
        data = {
            'nombre': 'Nuevo Proveedor',
            'contacto': 'Carlos López',
            'correo': 'carlos@test.com',
            'telefono': '777777777',
            'lead_time_dias': 7,
            'activo': True
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Proveedor.objects.count(), 2)
        
        nuevo_proveedor = Proveedor.objects.get(nombre='Nuevo Proveedor')
        self.assertEqual(nuevo_proveedor.contacto, 'Carlos López')

    def test_create_proveedor_invalid_data(self):
        """Test para crear un proveedor con datos inválidos"""
        data = {
            'nombre': '',  
            'contacto': 'Test',
            'correo': 'correo-invalido', 
            'telefono': '123',
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_proveedor(self):
        """Test para actualizar un proveedor completamente"""
        data = {
            'nombre': 'Proveedor Actualizado',
            'contacto': 'Pedro Gómez',
            'correo': 'pedro@test.com',
            'telefono': '666666666',
            'lead_time_dias': 10,
            'activo': False
        }
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.proveedor.refresh_from_db()
        self.assertEqual(self.proveedor.nombre, 'Proveedor Actualizado')
        self.assertEqual(self.proveedor.contacto, 'Pedro Gómez')
        self.assertEqual(self.proveedor.lead_time_dias, 10)
        self.assertFalse(self.proveedor.activo)

    def test_update_proveedor_not_found(self):
        """Test para actualizar un proveedor que no existe"""
        url = f'{self.list_url}999/'
        data = {'nombre': 'Proveedor Inexistente'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_proveedor(self):
        """Test para actualizar parcialmente un proveedor"""
        data = {'nombre': 'Parcial Actualizado'}
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.proveedor.refresh_from_db()
        self.assertEqual(self.proveedor.nombre, 'Parcial Actualizado')
        self.assertEqual(self.proveedor.contacto, 'Juan Pérez')

    def test_partial_update_multiple_fields(self):
        """Test para actualizar parcialmente múltiples campos"""
        data = {
            'nombre': 'Actualizado Parcial',
            'telefono': '555555555'
        }
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.proveedor.refresh_from_db()
        self.assertEqual(self.proveedor.nombre, 'Actualizado Parcial')
        self.assertEqual(self.proveedor.telefono, '555555555')
        self.assertEqual(self.proveedor.contacto, 'Juan Pérez')

    def test_partial_update_proveedor_not_found(self):
        """Test para actualizar parcialmente un proveedor que no existe"""
        url = f'{self.list_url}999/'
        data = {'nombre': 'Proveedor Inexistente'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_destroy_proveedor(self):
        """Test para eliminar un proveedor"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Proveedor.objects.count(), 0)

    def test_destroy_proveedor_not_found(self):
        """Test para eliminar un proveedor que no existe"""
        url = f'{self.list_url}999/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

