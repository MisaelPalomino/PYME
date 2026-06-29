from rest_framework import serializers

from .models import Categoria, Proveedor, Producto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = (
            "id_categoria",
            "nombre",
            "descripcion",
        )
        read_only_fields = ("id_categoria",)

    def validate_nombre(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "El nombre de la categoría es obligatorio."
            )

        return value


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = (
            "id_proveedor",
            "nombre",
            "contacto",
            "correo",
            "telefono",
            "lead_time_dias",
            "activo",
        )
        read_only_fields = ("id_proveedor",)

    def validate_lead_time_dias(self, value):

        if value < 0:
            raise serializers.ValidationError("El Lead Time no puede ser negativo.")

        return value


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(
        source="id_categoria.nombre", read_only=True
    )

    proveedor_nombre = serializers.CharField(
        source="id_proveedor_principal.nombre", read_only=True
    )

    class Meta:
        model = Producto

        fields = (
            "id_producto",
            "nombre",
            "sku",
            "descripcion",
            "precio",
            "stock_actual",
            "stock_minimo",
            "stock_maximo",
            "id_categoria",
            "categoria_nombre",
            "id_proveedor_principal",
            "proveedor_nombre",
        )

        read_only_fields = ("id_producto",)

    def validate_precio(self, value):

        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que cero.")

        return value

    def validate(self, attrs):

        stock_minimo = attrs.get("stock_minimo")
        stock_maximo = attrs.get("stock_maximo")
        stock_actual = attrs.get("stock_actual")

        if stock_minimo > stock_maximo:
            raise serializers.ValidationError(
                {"stock_minimo": "El stock mínimo no puede ser mayor que el máximo."}
            )

        if stock_actual > stock_maximo:
            raise serializers.ValidationError(
                {"stock_actual": "El stock actual no puede superar el stock máximo."}
            )

        return attrs
