from rest_framework import status, viewsets
from rest_framework.response import Response

from .serializer import (
    CategoriaSerializer,
    ProductoSerializer,
    ProveedorSerializer,
)
from .service import (
    CategoriaService,
    ProductoService,
    ProveedorService,
)


class CategoriaViewSet(viewsets.ViewSet):
    def list(self, request):
        categorias = CategoriaService.listar()
        serializer = CategoriaSerializer(categorias, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        categoria = CategoriaService.obtener(pk)
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)

    def create(self, request):
        serializer = CategoriaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        categoria = CategoriaService.crear(serializer)

        return Response(
            CategoriaSerializer(categoria).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, pk=None):
        categoria = CategoriaService.obtener(pk)

        serializer = CategoriaSerializer(categoria, data=request.data)

        serializer.is_valid(raise_exception=True)

        categoria = CategoriaService.actualizar(serializer)

        return Response(CategoriaSerializer(categoria).data)

    def destroy(self, request, pk=None):
        categoria = CategoriaService.obtener(pk)

        CategoriaService.eliminar(categoria)

        return Response(status=status.HTTP_204_NO_CONTENT)


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
            ProveedorSerializer(proveedor).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, pk=None):
        proveedor = ProveedorService.obtener(pk)

        serializer = ProveedorSerializer(proveedor, data=request.data)

        serializer.is_valid(raise_exception=True)

        proveedor = ProveedorService.actualizar(serializer)

        return Response(ProveedorSerializer(proveedor).data)

    def destroy(self, request, pk=None):
        proveedor = ProveedorService.obtener(pk)

        ProveedorService.eliminar(proveedor)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductoViewSet(viewsets.ViewSet):
    def list(self, request):
        productos = ProductoService.listar()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        producto = ProductoService.obtener(pk)
        serializer = ProductoSerializer(producto)
        return Response(serializer.data)

    def create(self, request):
        serializer = ProductoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        producto = ProductoService.crear(serializer)

        return Response(
            ProductoSerializer(producto).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, pk=None):
        producto = ProductoService.obtener(pk)

        serializer = ProductoSerializer(producto, data=request.data)

        serializer.is_valid(raise_exception=True)

        producto = ProductoService.actualizar(serializer)

        return Response(ProductoSerializer(producto).data)

    def destroy(self, request, pk=None):
        producto = ProductoService.obtener(pk)

        ProductoService.eliminar(producto)

        return Response(status=status.HTTP_204_NO_CONTENT)
