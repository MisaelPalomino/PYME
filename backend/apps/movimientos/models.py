from django.db import models
from apps.core.models import Producto
from apps.authentication.models import Usuario

class Movimiento(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    id_movimiento = models.BigAutoField(primary_key=True)
    tipo_movimiento = models.CharField(max_length=255, choices=TIPO_CHOICES)
    fecha = models.DateTimeField()
    cantidad = models.BigIntegerField()
    observaciones = models.TextField()
    id_producto = models.ForeignKey(Producto, on_delete=models.PROTECT, db_column='id_producto')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column='id_usuario')

    class Meta:
        db_table = 'movimiento_inventario'

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.cantidad} de {self.id_producto.nombre}"
