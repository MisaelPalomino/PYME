from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.authentication.urls")),
    path("api/core/", include("apps.core.urls")),
    path("api/inventario/", include("apps.inventario.urls")),
    path("api/pedidos/", include("apps.pedidos.urls")),
    path("api/ia/", include("apps.ia.urls")),
]