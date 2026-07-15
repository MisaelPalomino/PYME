from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import Categoria, Producto, Proveedor
from django.db.models import Case, When, Value, CharField, F


class CategoriaService:
    @staticmethod
    def listar():
        """Lista categorías con el conteo de productos."""
        return Categoria.objects.annotate(productos_count=Count("producto"))

    @staticmethod
    def obtener(id_categoria):
        """Obtiene una categoría con el conteo de productos."""
        return get_object_or_404(
            Categoria.objects.annotate(productos_count=Count("producto")),
            pk=id_categoria,
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


class ProductoService:
    @staticmethod
    def listar():
        return (
            Producto.objects
            .select_related("id_categoria", "id_proveedor_principal")
            .annotate(
                estado=Case(
                    When(stock_actual__lt=F("stock_minimo"), then=Value("Crítico")),
                    When(stock_actual=F("stock_minimo"), then=Value("Mínimo")),
                    default=Value("Normal"),
                    output_field=CharField(),
                )
            )
        )

    @staticmethod
    def obtener(id_producto):
        return get_object_or_404(
            Producto.objects
            .select_related("id_categoria", "id_proveedor_principal")
            .annotate(
                estado=Case(
                    When(stock_actual__lt=F("stock_minimo"), then=Value("Crítico")),
                    When(stock_actual=F("stock_minimo"), then=Value("Mínimo")),
                    default=Value("Normal"),
                    output_field=CharField(),
                )
            ),
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
