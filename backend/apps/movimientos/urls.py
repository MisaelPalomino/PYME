from django.urls import path
from .views import RegistrarMovimientoView

urlpatterns = [
    path(
        "registrar/",
        RegistrarMovimientoView.as_view(),
    ),
]