from django.db import models
from apps.core.models import Producto

class Prediccion(models.Model):
    id_prediccion = models.BigAutoField(primary_key=True)
    id_producto = models.ForeignKey(Producto, on_delete=models.PROTECT, db_column='id_producto')
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    horizonte_dias = models.BigIntegerField()
    demanda_predicha = models.DecimalField(max_digits=10, decimal_places=2) 

    class Meta:
        db_table = 'prediccion'

    def __str__(self):
        return f"Predicción para {self.id_producto.nombre} - {self.demanda_predicha}"


class ModeloIA(models.Model):
    id_modelo = models.BigAutoField(primary_key=True)
    id_producto = models.ForeignKey(Producto, on_delete=models.PROTECT, db_column='id_producto')
    fecha_entrenamiento = models.DateTimeField(auto_now_add=True)
    mae = models.DecimalField(max_digits=10, decimal_places=4)  
    mape = models.DecimalField(max_digits=10, decimal_places=4)
    estado = models.CharField(max_length=255) 

    class Meta:
        db_table = 'modeloIA'

    def __str__(self):
        return f"Modelo IA - Producto {self.id_producto.nombre} - MAE: {self.mae}"