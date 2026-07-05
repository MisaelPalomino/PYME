from django.db import models, connection
import json


class Proveedor(models.Model):
    id_proveedor = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    contacto = models.CharField(max_length=255)
    correo = models.EmailField(max_length=255)
    telefono = models.CharField(max_length=255)
    lead_time_dias = models.BigIntegerField()
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = "proveedor"

    @property
    def porcentaje_cumplimiento(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT porcentaje_cumplimiento_proveedor(%s)",
                [self.id_proveedor],
            )
            return cursor.fetchone()[0]

    @property
    def categorias(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT categorias_proveedor(%s)",
                [self.id_proveedor],
            )
            return json.loads(cursor.fetchone()[0])

    def __str__(self):
        return self.nombre
