from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import Categoria, Producto, Proveedor


class CategoriaService:
    @staticmethod
    def listar():
        """Lista categorías con el conteo de productos."""
        return Categoria.objects.annotate(
            productos_count=Count('producto')
        )

    @staticmethod
    def obtener(id_categoria):
        """Obtiene una categoría con el conteo de productos."""
        return get_object_or_404(
            Categoria.objects.annotate(
                productos_count=Count('producto')
            ),
            pk=id_categoria
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
