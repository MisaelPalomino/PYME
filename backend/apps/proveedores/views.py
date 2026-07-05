from rest_framework import status, viewsets
from rest_framework.response import Response

from .serializer import ProveedorSerializer
from .service import ProveedorService


class ProveedorViewSet(viewsets.ViewSet):
    def list(self, request):
        proveedores = ProveedorService.listar()

        serializer = ProveedorSerializer(proveedores, many=True)

        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        proveedor = ProveedorService.obtener(pk)

        serializer = ProveedorSerializer(proveedor)

        return Response(serializer.data)

    def create(self, request):
        serializer = ProveedorSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        proveedor = ProveedorService.crear(serializer)

        return Response(
            ProveedorSerializer(proveedor).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, pk=None):
        proveedor = ProveedorService.obtener(pk)

        serializer = ProveedorSerializer(
            proveedor,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        proveedor = ProveedorService.actualizar(pk, serializer)

        return Response(ProveedorSerializer(proveedor).data)

    def partial_update(self, request, pk=None):
        proveedor = ProveedorService.obtener(pk)

        serializer = ProveedorSerializer(
            proveedor,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        proveedor = ProveedorService.actualizar(pk, serializer)

        return Response(ProveedorSerializer(proveedor).data)

    def destroy(self, request, pk=None):
        ProveedorService.eliminar(pk)

        return Response(status=status.HTTP_204_NO_CONTENT)
