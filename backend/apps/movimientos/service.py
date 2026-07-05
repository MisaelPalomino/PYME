from django.db import transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers

from apps.core.models import Producto
from apps.inventario.models import MovimientoInventario as Movimiento


class MovimientoService:
    @staticmethod
    def listar(tipo=None, busqueda=None):
        queryset = Movimiento.objects.select_related('id_producto', 'id_usuario')

        if tipo:
            queryset = queryset.filter(tipo_movimiento=tipo)

        if busqueda:
            queryset = queryset.filter(
                Q(id_producto__nombre__icontains=busqueda) |
                Q(id_producto__sku__icontains=busqueda)
            )

        return queryset

    @staticmethod
    @transaction.atomic
    def registrar(tipo_movimiento, id_producto, cantidad, id_usuario, observaciones):
        producto = get_object_or_404(
            Producto.objects.select_for_update(), pk=id_producto
        )

        if tipo_movimiento == 'salida' and cantidad > producto.stock_actual:
            raise serializers.ValidationError(
                {"cantidad": "Stock insuficiente para registrar esta salida."}
            )

        delta = cantidad if tipo_movimiento == 'entrada' else -cantidad
        producto.stock_actual = F('stock_actual') + delta
        producto.save(update_fields=['stock_actual'])

        movimiento = Movimiento.objects.create(
            tipo_movimiento=tipo_movimiento,
            fecha=timezone.now(),
            cantidad=cantidad,
            observaciones=observaciones,
            id_producto_id=id_producto,
            id_usuario_id=id_usuario,
        )
        return movimiento
