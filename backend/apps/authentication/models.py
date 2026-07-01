from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    id_usuario = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    rol = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    last_login = None
    first_name = None
    last_name = None
    is_staff = None
    is_superuser = None
    date_joined = None

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return self.username
    
    @property
    def id(self):
        return self.id_usuario
    
    @property
    def is_active(self):
        return self.activo

    @is_active.setter
    def is_active(self, value):
        self.activo = value