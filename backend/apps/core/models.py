from django.db import models, connection

from apps.proveedores.models import Proveedor


class Categoria(models.Model):
    id_categoria = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()

    class Meta:
        db_table = "categoria"

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    id_producto = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, unique=True)
    descripcion = models.TextField()
    stock_actual = models.BigIntegerField()
    stock_minimo = models.BigIntegerField()
    stock_maximo = models.BigIntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    id_categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, db_column="id_categoria"
    )
    id_proveedor_principal = models.ForeignKey(
        Proveedor, on_delete=models.PROTECT, db_column="id_proveedor_principal"
    )

    class Meta:
        db_table = "producto"

    def __str__(self):
        return f"{self.nombre} ({self.sku})"
