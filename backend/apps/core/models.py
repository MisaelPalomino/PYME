from django.db import models

class Categoria(models.Model):
    id_categoria = models.BigAutoField(primary_key=True)  
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()  

    class Meta:
        db_table = 'categoria' 

    def __str__(self):
        return self.nombre


class Proveedor(models.Model):
    id_proveedor = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    contacto = models.CharField(max_length=255)
    correo = models.EmailField(max_length=255)
    telefono = models.CharField(max_length=255)
    lead_time_dias = models.BigIntegerField()
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'proveedor'

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
    id_categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, db_column='id_categoria')
    id_proveedor_principal = models.ForeignKey(Proveedor, on_delete=models.PROTECT, db_column='id_proveedor_principal')

    class Meta:
        db_table = 'producto'

    def __str__(self):
        return f"{self.nombre} ({self.sku})"