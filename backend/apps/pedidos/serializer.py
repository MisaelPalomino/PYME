from rest_framework import serializers

from .models import Pedido, DetallePedido
from apps.core.models import Producto


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source="id_producto.nombre", read_only=True)

    class Meta:
        model = DetallePedido
        fields = [
            "id_detalle",
            "id_producto",
            "producto_nombre",
            "cantidad",
            "precio_unitario",
        ]
        read_only_fields = ["id_detalle"]

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor que cero.")
        return value

    def validate_precio_unitario(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que cero.")
        return value


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(
        source="detallepedido_set", many=True, read_only=True
    )

    proveedor_nombre = serializers.CharField(
        source="id_proveedor.nombre", read_only=True
    )

    usuario_nombre = serializers.CharField(source="id_usuario.nombre", read_only=True)

    class Meta:
        model = Pedido
        fields = [
            "id_pedido",
            "id_proveedor",
            "proveedor_nombre",
            "id_usuario",
            "usuario_nombre",
            "estado",
            "fecha_creacion",
            "fecha_envio",
            "fecha_recepcion",
            "detalles",
        ]

        read_only_fields = [
            "id_pedido",
            "fecha_creacion",
            "fecha_envio",
            "fecha_recepcion",
            "estado",
        ]

    def validate_detalles(self, value):

        if len(value) == 0:
            raise serializers.ValidationError(
                "El pedido debe contener al menos un producto."
            )

        productos = set()

        for detalle in value:
            producto = detalle["id_producto"]

            if producto.id_producto in productos:
                raise serializers.ValidationError(
                    f"El producto {producto.nombre} está repetido."
                )

            productos.add(producto.id_producto)

        return value
