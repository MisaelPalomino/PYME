from django.urls import path

from .views import HistorialProductoView, MovimientoListCreateView

urlpatterns = [
    path('', MovimientoListCreateView.as_view()),
    path('producto/<int:id_producto>/', HistorialProductoView.as_view()),
]
