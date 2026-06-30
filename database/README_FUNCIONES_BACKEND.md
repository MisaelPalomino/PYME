# Funciones disponibles y sus llamadas


# Registrar movimiento (RF03)

Entrada 50 unidades al producto 3 por el usuario 2.

```sql
SELECT registrar_movimiento(
    'entrada',
    3,
    50,
    2,
    'Compra al proveedor'
);
```

Registrar salida 12 unidades mismo producto.

```sql
SELECT registrar_movimiento(
    'salida',
    3,
    12,
    2,
    'Venta realizada'
);
```

Comprobar stock.

```sql
SELECT
    id_producto,
    nombre,
    stock_actual
FROM producto
WHERE id_producto = 3;
```

---

# Obtener stock por estado (RF04)

Todos los productos.

```sql
SELECT *
FROM obtener_stock_por_estado();
```

Solo categoría 2(lacteos).

```sql
SELECT *
FROM obtener_stock_por_estado(2);
```

---

# Historial de movimientos (RF05)

Producto 3.

```sql
SELECT *
FROM historial_producto(3);
```

Producto 10.

```sql
SELECT *
FROM historial_producto(10);
```

---

# Generar alertas por predicción (RF09-RF10)

Ejecutar.

```sql
SELECT generar_alertas_prediccion();
```

Ver las alertas generadas.

```sql
SELECT *
FROM alerta
ORDER BY fecha_creacion DESC;
```

---

# Actualizar estado de pedido (RF12)

Cambiar pedido 7 a enviado.

```sql
SELECT actualizar_estado_pedido(
    7,
    'enviado'
);
```

Verificar.

```sql
SELECT
    id_pedido,
    estado
FROM pedido
WHERE id_pedido = 7;
```

---

# Recibir pedido (RF13)

Marcar el pedido 4 como recibido.

```sql
SELECT recibir_pedido(
    4,
    2
);
```

Comprobar el pedido.

```sql
SELECT
    estado,
    fecha_recepcion
FROM pedido
WHERE id_pedido = 4;
```

Comprobar el stock actualizado.

```sql
SELECT
    id_producto,
    stock_actual
FROM producto;
```

Comprobar los movimientos registrados.

```sql
SELECT *
FROM movimiento_inventario
ORDER BY fecha DESC;
```

---

# Listar pedidos (RF14)

Todos.

```sql
SELECT *
FROM listar_pedidos();
```

Solo pendientes.

```sql
SELECT *
FROM listar_pedidos('pendiente');
```

Solo enviados.

```sql
SELECT *
FROM listar_pedidos('enviado');
```

Todos los pedidos del proveedor 3.

```sql
SELECT *
FROM listar_pedidos(
    NULL,
    3
);
```

Pedidos pendientes del proveedor 3.

```sql
SELECT *
FROM listar_pedidos(
    'pendiente',
    3
);
```

---

# Reporte bajo stock (RF15)

```sql
SELECT *
FROM reporte_bajo_stock;
```

Ordenado por menor stock.

```sql
SELECT *
FROM reporte_bajo_stock
ORDER BY stock_actual;
```

---

# Reporte de rotación (RF16)

```sql
SELECT *
FROM reporte_rotacion;
```

Productos con más ventas.

```sql
SELECT *
FROM reporte_rotacion
ORDER BY ventas_30_dias DESC;
```

---

# Reporte consolidado (RF17)

```sql
SELECT *
FROM reporte_consolidado;
```

Solo modelos entrenados.
Posibles estados: entrenado, sin_datos, desactualizado

```sql
SELECT *
FROM reporte_consolidado
WHERE estado = 'entrenado';
```

Productos con mayor MAE.

```sql
SELECT *
FROM reporte_consolidado
ORDER BY mae DESC;
```

---

# Porcentaje de cumplimiento de proveedor (RF22)

Proveedor 1.

```sql
SELECT porcentaje_cumplimiento_proveedor(1);
```

Proveedor 5.

```sql
SELECT porcentaje_cumplimiento_proveedor(5);
```

Todos los proveedores.

```sql
SELECT
    id_proveedor,
    nombre,
    porcentaje_cumplimiento_proveedor(id_proveedor)
FROM proveedor;
```

---

# Dashboard (RF24)

Consultar el resumen.

```sql
SELECT *
FROM dashboard_resumen;
```

---

# Trigger de stock negativo

Intentar provocar un error.

```sql
UPDATE producto
SET stock_actual = -5
WHERE id_producto = 3;
```

Resultado esperado:

```
ERROR: Stock negativo no permitido
```

---

# Trigger de alerta por bajo stock

Actualizar el stock para quedar por debajo del mínimo.

```sql
UPDATE producto
SET stock_actual = stock_minimo - 1
WHERE id_producto = 4;
```

Verificar la alerta creada.

```sql
SELECT *
FROM alerta
WHERE id_producto = 4
ORDER BY fecha_creacion DESC;
```

