from django.urls import path

from .views import StockInventarioView, HistorialProductoView

urlpatterns = [
    path("stock/", StockInventarioView.as_view()),
    path("historial/<int:id_producto>/", HistorialProductoView.as_view()),
]