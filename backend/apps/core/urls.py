from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoriaViewSet,
    ProductoViewSet,
    ProveedorViewSet,
)

router = DefaultRouter()

router.register(
    "categorias",
    CategoriaViewSet,
    basename="categorias"
)

router.register(
    "proveedores",
    ProveedorViewSet,
    basename="proveedores"
)

router.register(
    "productos",
    ProductoViewSet,
    basename="productos"
)

urlpatterns = [
    path("", include(router.urls)),
]