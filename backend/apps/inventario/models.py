from django.db import models
from apps.core.models import Producto
from apps.authentication.models import Usuario

class Alerta(models.Model):
    id_alerta = models.BigAutoField(primary_key=True)
    mensaje = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    id_producto = models.ForeignKey(Producto, on_delete=models.PROTECT, db_column='id_producto')
    tipo_alerta = models.CharField(max_length=255)

    class Meta:
        db_table = 'alerta'

    def __str__(self):
        return f"{self.tipo_alerta}: {self.mensaje[:30]}..."


class Notificacion(models.Model):
    id_notificacion = models.BigAutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column='id_usuario')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    mensaje = models.TextField()
    titulo = models.CharField(max_length=255)

    class Meta:
        db_table = 'notificacion'

    def __str__(self):
        return f"{self.titulo} - {self.mensaje[:30]}..."