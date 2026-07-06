import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split
from datetime import timedelta
from django.utils import timezone
from apps.movimientos.models import Movimiento


class IACalculations:
    """Utilidades para cálculos de IA y predicciones."""

    @staticmethod
    def preparar_datos(producto, dias_historial=365):
        """
        Prepara los datos históricos para entrenar el modelo.
        Mínimo requerido: 2 movimientos (para pruebas rápidas).
        """
        fecha_limite = timezone.now() - timedelta(days=dias_historial)

        movimientos = Movimiento.objects.filter(
            id_producto=producto, tipo_movimiento="salida", fecha__gte=fecha_limite
        ).order_by("fecha")

        n_movimientos = movimientos.count()
        if n_movimientos < 2:
            return None, None, n_movimientos

        df = pd.DataFrame(list(movimientos.values("fecha", "cantidad")))
        df["fecha"] = pd.to_datetime(df["fecha"])
        df = df.groupby(pd.Grouper(key="fecha", freq="D")).sum().fillna(0)

        df["demanda_7d"] = df["cantidad"].rolling(window=2, min_periods=1).mean().shift(1)
        df["demanda_14d"] = df["cantidad"].rolling(window=3, min_periods=1).mean().shift(1)
        df["demanda_30d"] = df["cantidad"].rolling(window=5, min_periods=1).mean().shift(1)

        proveedor = getattr(producto, "id_proveedor_principal", None)
        df["lead_time"] = getattr(proveedor, "lead_time_dias", 7)
        df["dia_semana"] = df.index.dayofweek
        df["mes"] = df.index.month

        df = df.dropna()

        if len(df) < 2:
            return None, None, n_movimientos

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

        return X, y, n_movimientos

    @staticmethod
    def entrenar_modelo(producto):
        """
        Entrena un modelo Random Forest para un producto.
        Mínimo requerido: 2 muestras.
        """
        X, y, n_movimientos = IACalculations.preparar_datos(producto)

        if X is None or len(X) < 2:
            return None, None, None, n_movimientos

        if len(X) < 5:
            modelo = RandomForestRegressor(
                n_estimators=20,
                max_depth=5,
                min_samples_leaf=1,
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            )
            modelo.fit(X, y)

            y_pred = modelo.predict(X)
            mae = mean_absolute_error(y, y_pred)

            if np.any(y == 0):
                mape = 0
            else:
                mape = mean_absolute_percentage_error(y, y_pred) * 100

            return modelo, mae, mape, n_movimientos

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
        )

        modelo = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_leaf=1,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        )

        modelo.fit(X_train, y_train)

        y_pred = modelo.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)

        if np.any(y_test == 0):
            mape = 0
        else:
            mape = mean_absolute_percentage_error(y_test, y_pred) * 100

        return modelo, mae, mape, n_movimientos

    @staticmethod
    def predecir_demanda(modelo, producto, dias):
        """
        Predice la demanda para un número de días específico.
        """
        if modelo is None:
            return 0

        fecha_limite = timezone.now() - timedelta(days=365)

        movimientos = Movimiento.objects.filter(
            id_producto=producto,
            tipo_movimiento="salida",
            fecha__gte=fecha_limite,
        ).order_by("fecha")

        proveedor = getattr(producto, "id_proveedor_principal", None)
        lead_time = getattr(proveedor, "lead_time_dias", 7)

        if movimientos.count() < 2:
            ahora = timezone.now()

            features = np.array(
                [[10, 12, 15, lead_time, ahora.weekday(), ahora.month]]
            )

            prediccion = modelo.predict(features)[0]
            factor = dias / 7
            return max(0, prediccion * factor)

        df = pd.DataFrame(list(movimientos.values("fecha", "cantidad")))
        df["fecha"] = pd.to_datetime(df["fecha"])
        df = df.groupby(pd.Grouper(key="fecha", freq="D")).sum().fillna(0)

        demanda_7d = df["cantidad"].tail(7).mean()
        demanda_14d = df["cantidad"].tail(14).mean()
        demanda_30d = df["cantidad"].tail(30).mean()

        ahora = timezone.now()
        dia_semana = ahora.weekday()
        mes = ahora.month

        features = np.array(
            [[demanda_7d, demanda_14d, demanda_30d, lead_time, dia_semana, mes]]
        )
        prediccion = modelo.predict(features)[0]

        factor = dias / 7
        return max(0, prediccion * factor)
