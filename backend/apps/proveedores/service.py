from django.shortcuts import get_object_or_404
from django.db import transaction

from ..core.models import Proveedor


class ProveedorService:
    @staticmethod
    def _get_base_queryset():
        """
        Queryset base para evitar duplicar código.
        """
        return Proveedor.objects.all()

    @staticmethod
    def listar():
        """
        Lista todos los proveedores.
        """
        return ProveedorService._get_base_queryset().order_by("nombre")

    @staticmethod
    def obtener(id_proveedor):
        """
        Obtiene un proveedor por su id.
        """
        return get_object_or_404(
            ProveedorService._get_base_queryset(),
            pk=id_proveedor,
        )

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        """
        Crea un proveedor.
        """
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def actualizar(id_proveedor, serializer):
        """
        Actualiza un proveedor.
        """
        proveedor = ProveedorService.obtener(id_proveedor)
        serializer.instance = proveedor
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def eliminar(id_proveedor):
        """
        Elimina un proveedor.
        """
        proveedor = ProveedorService.obtener(id_proveedor)
        proveedor.delete()

