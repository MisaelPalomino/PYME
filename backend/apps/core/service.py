from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Categoria, Producto, Proveedor


class CategoriaService:
    @staticmethod
    def listar():
        return Categoria.objects.all()

    @staticmethod
    def obtener(id_categoria):
        return get_object_or_404(Categoria, pk=id_categoria)

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def actualizar(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def eliminar(categoria):
        categoria.delete()


class ProveedorService:
    @staticmethod
    def listar():
        return Proveedor.objects.all()

    @staticmethod
    def obtener(id_proveedor):
        return get_object_or_404(Proveedor, pk=id_proveedor)

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def actualizar(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def eliminar(proveedor):
        proveedor.delete()


class ProductoService:
    @staticmethod
    def listar():
        return Producto.objects.select_related("id_categoria", "id_proveedor_principal")

    @staticmethod
    def obtener(id_producto):
        return get_object_or_404(
            Producto.objects.select_related("id_categoria", "id_proveedor_principal"),
            pk=id_producto,
        )

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def actualizar(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def eliminar(producto):
        producto.delete()
