import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split
from datetime import timedelta
from django.utils import timezone
from apps.inventario.models import MovimientoInventario
from apps.core.models import Producto


class IACalculations:
    """Utilidades para cálculos de IA y predicciones."""

    @staticmethod
    def preparar_datos(producto, dias_historial=90):
        """
        Prepara los datos históricos para entrenar el modelo.
        Mínimo requerido: 2 movimientos (para pruebas rápidas).
        """
        fecha_limite = timezone.now() - timedelta(days=dias_historial)

        movimientos = MovimientoInventario.objects.filter(
            id_producto=producto, tipo_movimiento="salida", fecha__gte=fecha_limite
        ).order_by("fecha")

        if movimientos.count() < 2:
            return None, None

        df = pd.DataFrame(list(movimientos.values("fecha", "cantidad")))
        df["fecha"] = pd.to_datetime(df["fecha"])
        df = df.groupby(pd.Grouper(key="fecha", freq="D")).sum().fillna(0)

        df["demanda_7d"] = df["cantidad"].rolling(window=7).mean().shift(1)
        df["demanda_14d"] = df["cantidad"].rolling(window=14).mean().shift(1)
        df["demanda_30d"] = df["cantidad"].rolling(window=30).mean().shift(1)
        df["lead_time"] = producto.id_proveedor_principal.lead_time_dias
        df["dia_semana"] = df.index.dayofweek
        df["mes"] = df.index.month

        df = df.dropna()

        if len(df) < 2:
            return None, None

        X = df[
            [
                "demanda_7d",
                "demanda_14d",
                "demanda_30d",
                "lead_time",
                "dia_semana",
                "mes",
            ]
        ].values
        y = df["cantidad"].values

        return X, y

    @staticmethod
    def entrenar_modelo(producto):
        """
        Entrena un modelo Random Forest para un producto.
        Mínimo requerido: 2 muestras.
        """
        X, y = IACalculations.preparar_datos(producto)

        if X is None or len(X) < 2:
            return None, None, None, 0

        if len(X) < 3:
            # Usar todos los datos para entrenar 
            modelo = RandomForestRegressor(
                n_estimators=10,  # Menos árboles para datos pequeños
                max_depth=5,
                min_samples_leaf=1,
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            )
            modelo.fit(X, y)

            y_pred = modelo.predict(X)
            mae = mean_absolute_error(y, y_pred)
            mape = mean_absolute_percentage_error(y, y_pred) * 100

            return modelo, mae, mape, len(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        modelo = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_leaf=4,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        )
        modelo.fit(X_train, y_train)

        y_pred = modelo.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred) * 100

        return modelo, mae, mape, len(X)

    @staticmethod
    def predecir_demanda(modelo, producto, dias):
        """
        Predice la demanda para un número de días específico.
        """
        if modelo is None:
            return 0

        fecha_limite = timezone.now() - timedelta(days=30)

        movimientos = MovimientoInventario.objects.filter(
            id_producto=producto, tipo_movimiento="salida", fecha__gte=fecha_limite
        ).order_by("fecha")

        if movimientos.count() < 2:
            demanda_7d = 10
            demanda_14d = 12
            demanda_30d = 15
            lead_time = producto.id_proveedor_principal.lead_time_dias
            ahora = timezone.now()
            dia_semana = ahora.weekday()
            mes = ahora.month

            features = np.array(
                [[demanda_7d, demanda_14d, demanda_30d, lead_time, dia_semana, mes]]
            )
            prediccion = modelo.predict(features)[0]
            factor = dias / 7
            return prediccion * factor

        df = pd.DataFrame(list(movimientos.values("fecha", "cantidad")))
        df["fecha"] = pd.to_datetime(df["fecha"])
        df = df.groupby(pd.Grouper(key="fecha", freq="D")).sum().fillna(0)

        demanda_7d = (
            df["cantidad"].tail(7).mean() if len(df) >= 7 else df["cantidad"].mean()
        )
        demanda_14d = (
            df["cantidad"].tail(14).mean() if len(df) >= 14 else df["cantidad"].mean()
        )
        demanda_30d = (
            df["cantidad"].tail(30).mean() if len(df) >= 30 else df["cantidad"].mean()
        )
        lead_time = producto.id_proveedor_principal.lead_time_dias

        ahora = timezone.now()
        dia_semana = ahora.weekday()
        mes = ahora.month

        features = np.array(
            [[demanda_7d, demanda_14d, demanda_30d, lead_time, dia_semana, mes]]
        )
        prediccion = modelo.predict(features)[0]

        factor = dias / 7
        return prediccion * factor
