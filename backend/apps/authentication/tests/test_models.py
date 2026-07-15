from django.test import TestCase
from ..models import Usuario

class UsuarioModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            username="jdoe",
            password="pass1234",
            nombre="John Doe",
            email="john@test.com",
            rol="Administrador",
            activo=True,
        )

    def test_str_devuelve_username(self):
        self.assertEqual(str(self.usuario), "jdoe")

    def test_pk_es_id_usuario(self):
        # id_usuario fue declarado como primary_key explícita en el modelo;
        # esta prueba evita que alguien la reemplace por 'id' sin darse cuenta.
        self.assertEqual(self.usuario.pk, self.usuario.id_usuario)

    def test_is_active_refleja_el_campo_activo(self):
        self.assertTrue(self.usuario.is_active)
        self.usuario.activo = False
        self.assertFalse(self.usuario.is_active)

    def test_is_active_setter_actualiza_activo(self):
        self.usuario.is_active = False
        self.assertFalse(self.usuario.activo)

    def test_password_no_se_hashea_al_crear(self):
        # contraseña sin hash.
        # si alguien agrega set_password() por error, esto falla.
        self.assertEqual(self.usuario.password, "pass1234")