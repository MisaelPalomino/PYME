from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProveedorViewSet

router = DefaultRouter()

router.register("proveedores", ProveedorViewSet, basename="proveedores")

urlpatterns = [
    path("", include(router.urls)),
]
