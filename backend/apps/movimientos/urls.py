from django.urls import path
from .views import MovimientoListCreateView

urlpatterns = [
    path(
        "",
        MovimientoListCreateView.as_view(),
    ),
]