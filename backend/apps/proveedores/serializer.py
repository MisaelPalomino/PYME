from rest_framework import serializers

from ..core.models import Proveedor


class ProveedorSerializer(serializers.ModelSerializer):
    porcentaje_cumplimiento = serializers.SerializerMethodField()

    class Meta:
        model = Proveedor
        fields = [
            "id_proveedor",
            "nombre",
            "contacto",
            "correo",
            "telefono",
            "lead_time_dias",
            "activo",
            "porcentaje_cumplimiento",
            "categorias",
        ]
        read_only_fields = [
            "id_proveedor",
            "porcentaje_cumplimiento",
            "categorias",
        ]

    def get_porcentaje_cumplimiento(self, obj):
        return obj.porcentaje_cumplimiento

    def get_categorias(self, obj):
        return obj.categorias

    def validate_lead_time_dias(self, value):
        if value < 0:
            raise serializers.ValidationError("El lead time no puede ser negativo.")
        return value

    def validate_correo(self, value):
        if not value:
            raise serializers.ValidationError("El correo es obligatorio.")
        return value
