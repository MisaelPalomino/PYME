from django.db import models
from apps.core.models import Proveedor, Producto
from apps.authentication.models import Usuario

class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Enviado'),
        ('recibido', 'Recibido'),
    ]
    id_pedido = models.BigAutoField(primary_key=True)
    fecha_envio = models.DateTimeField(null=True, blank=True)  
    fecha_recepcion = models.DateTimeField(null=True, blank=True)
    id_proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, db_column='id_proveedor')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column='id_usuario')
    estado = models.CharField(max_length=255, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pedido'

    def __str__(self):
        return f"Pedido #{self.id_pedido} - {self.estado}"


class DetallePedido(models.Model):
    id_detalle = models.BigAutoField(primary_key=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)  
    id_pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, db_column='id_pedido')
    id_producto = models.ForeignKey(Producto, on_delete=models.PROTECT, db_column='id_producto')
    cantidad = models.BigIntegerField()

    class Meta:
        db_table = 'detalle_pedido'

    def __str__(self):
        return f"Detalle {self.id_detalle} - Pedido {self.id_pedido.id_pedido}"