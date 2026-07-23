# apps/pedidos/serializer.py
from rest_framework import serializers
from .models import Pedido, DetallePedido


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

    # Campos que vienen del annotate en el service
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    fecha_esperada = serializers.DateTimeField(read_only=True)

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
            "fecha_esperada",
            "detalles",
            "total",
        ]
        read_only_fields = [
            "id_pedido",
            "fecha_creacion",
            "fecha_envio",
            "fecha_recepcion",
            "estado",
        ]

    def to_internal_value(self, data):
        detalles_input = data.get("detalles")
        result = super().to_internal_value(
            {k: v for k, v in data.items() if k != "detalles"}
        )
        if detalles_input is not None:
            serializer = DetallePedidoSerializer(data=detalles_input, many=True)
            serializer.is_valid(raise_exception=True)
            result["detalles"] = serializer.validated_data
        return result

    def validate_detalles(self, value):
        """
        Valida que los detalles del pedido no estén vacíos
        y que no haya productos duplicados.
        """
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

    def validate(self, attrs):
        """
        Validaciones adicionales a nivel de todo el pedido.
        """
        estado = attrs.get("estado")

        # Si el pedido se marca como "enviado", debe tener fecha_envio
        if estado == "enviado" and not attrs.get("fecha_envio"):
            raise serializers.ValidationError(
                {
                    "fecha_envio": "Debe proporcionar fecha de envío para estado 'enviado'"
                }
            )

        # Si el pedido se marca como "recibido", debe tener fecha_recepcion
        if estado == "recibido" and not attrs.get("fecha_recepcion"):
            raise serializers.ValidationError(
                {
                    "fecha_recepcion": "Debe proporcionar fecha de recepción para estado 'recibido'"
                }
            )

        return attrs

