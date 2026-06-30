-- RF3, entrada / salida productos 
CREATE OR REPLACE FUNCTION registrar_movimiento(
    p_tipo_movimiento VARCHAR,
    p_id_producto INTEGER,
    p_cantidad INTEGER,
    p_id_usuario INTEGER,
    p_observaciones TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO movimiento_inventario(
        tipo_movimiento,
        fecha,
        cantidad,
        observaciones,
        id_producto,
        id_usuario
    )
    VALUES(
        p_tipo_movimiento,
        NOW(),
        p_cantidad,
        p_observaciones,
        p_id_producto,
        p_id_usuario
    );

    IF p_tipo_movimiento = 'entrada' THEN

        UPDATE producto
        SET stock_actual = stock_actual + p_cantidad
        WHERE id_producto = p_id_producto;

    ELSIF p_tipo_movimiento = 'salida' THEN

        UPDATE producto
        SET stock_actual = stock_actual - p_cantidad
        WHERE id_producto = p_id_producto;

    END IF;

END;
$$;

-- RF4, filtros por categoria y determinar estado stock
CREATE OR REPLACE FUNCTION obtener_stock_por_estado(
    p_categoria INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id_producto INTEGER,
    nombre VARCHAR,
    stock_actual INTEGER,
    estado_stock TEXT
)
LANGUAGE sql
AS $$
SELECT
    p.id_producto,
    p.nombre,
    p.stock_actual,
    CASE
        WHEN p.stock_actual = 0 THEN 'Agotado'
        WHEN p.stock_actual <= p.stock_minimo THEN 'Critico'
        ELSE 'Normal'
    END
FROM producto p
WHERE
    p_categoria IS NULL
    OR p.id_categoria = p_categoria;
$$;

-- RF5, Historial movimientos de producto
CREATE OR REPLACE FUNCTION historial_producto(
    p_id_producto INTEGER
)
RETURNS TABLE(
    fecha TIMESTAMPTZ,
    tipo_movimiento VARCHAR,
    cantidad INTEGER,
    observaciones TEXT
)
LANGUAGE sql
AS $$
SELECT
    fecha,
    tipo_movimiento,
    cantidad,
    observaciones
FROM movimiento_inventario
WHERE id_producto = p_id_producto
ORDER BY fecha DESC;
$$;

-- RF9,RF10, Generar alertas automaticas
-- Critica y preventiva dependiendo de dias predichos
CREATE OR REPLACE FUNCTION generar_alertas_prediccion()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN

    FOR r IN
        SELECT
            p.id_producto,
            p.nombre,
            p.stock_actual,
            pr.demanda_predicha
        FROM producto p
        JOIN prediccion pr
            ON pr.id_producto = p.id_producto
    LOOP

        IF r.demanda_predicha > 0 THEN

            IF r.stock_actual / r.demanda_predicha <= 3 THEN

                INSERT INTO alerta(
                    mensaje,
                    fecha_creacion,
                    leida,
                    id_producto,
                    tipo_alerta
                )
                VALUES(
                    'Stock crítico según predicción',
                    NOW(),
                    FALSE,
                    r.id_producto,
                    'Critica'
                );

            ELSIF r.stock_actual / r.demanda_predicha <= 7 THEN

                INSERT INTO alerta(
                    mensaje,
                    fecha_creacion,
                    leida,
                    id_producto,
                    tipo_alerta
                )
                VALUES(
                    'Stock preventivo según predicción',
                    NOW(),
                    FALSE,
                    r.id_producto,
                    'Preventiva'
                );

            END IF;

        END IF;

    END LOOP;

END;
$$;

-- RF12, cambios de estado de un pedido
CREATE OR REPLACE FUNCTION actualizar_estado_pedido(
    p_id_pedido INTEGER,
    p_estado VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE pedido
    SET estado = p_estado
    WHERE id_pedido = p_id_pedido;

END;
$$;

-- RF13,
CREATE OR REPLACE FUNCTION recibir_pedido(
    p_id_pedido INTEGER,
    p_id_usuario INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN

    UPDATE pedido
    SET
        estado = 'recibido',
        fecha_recepcion = NOW()
    WHERE id_pedido = p_id_pedido;

    -- Se agregan productos recibidos
    FOR r IN
        SELECT
            id_producto,
            cantidad
        FROM detalle_pedido
        WHERE id_pedido = p_id_pedido
    LOOP

        UPDATE producto
        SET stock_actual = stock_actual + r.cantidad
        WHERE id_producto = r.id_producto;

        -- Se registra en historial de movimientos
        INSERT INTO movimiento_inventario(
            tipo_movimiento,
            fecha,
            cantidad,
            observaciones,
            id_producto,
            id_usuario
        )
        VALUES(
            'entrada',
            NOW(),
            r.cantidad,
            'RECEPCION PEDIDO',
            r.id_producto,
            p_id_usuario
        );

    END LOOP;

END;
$$;

-- RF14 pedidos por filtros(estado y/o proveedor)
CREATE OR REPLACE FUNCTION listar_pedidos(
    p_estado VARCHAR DEFAULT NULL,
    p_proveedor INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id_pedido INTEGER,
    proveedor VARCHAR,
    estado VARCHAR,
    fecha_creacion TIMESTAMPTZ
)
LANGUAGE sql
AS $$
SELECT
    pe.id_pedido,
    pr.nombre,
    pe.estado,
    pe.fecha_creacion
FROM pedido pe
JOIN proveedor pr
    ON pe.id_proveedor = pr.id_proveedor
WHERE
    (p_estado IS NULL OR pe.estado = p_estado)
AND
    (p_proveedor IS NULL OR pe.id_proveedor = p_proveedor);
$$;

-- RF15, productos con stock <= al minimo
CREATE OR REPLACE VIEW reporte_bajo_stock AS
SELECT
    id_producto,
    nombre,
    stock_actual,
    stock_minimo
FROM producto
WHERE stock_actual <= stock_minimo;

-- RF16, compara ventas de ultimos 30 dias con stock promedio(de 30 dias)
CREATE OR REPLACE VIEW reporte_rotacion AS
SELECT
    p.id_producto,
    p.nombre,

    COALESCE(
        SUM(
            CASE
                WHEN m.tipo_movimiento = 'salida'
                THEN m.cantidad
                ELSE 0
            END
        ),
        0
    ) AS ventas_30_dias,

    p.stock_actual

FROM producto p

LEFT JOIN movimiento_inventario m
    ON m.id_producto = p.id_producto
   AND m.fecha >= NOW() - INTERVAL '30 days'

GROUP BY
    p.id_producto,
    p.nombre,
    p.stock_actual;


-- RF17, Reporte de stock baco, rotacion, metricas precision modelo
CREATE OR REPLACE VIEW reporte_consolidado AS
SELECT
    p.id_producto,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    pr.demanda_predicha,
    m.mae,
    m.mape,
    m.estado
FROM producto p
LEFT JOIN prediccion pr
    ON p.id_producto = pr.id_producto
LEFT JOIN modelo_ia m
    ON p.id_producto = m.id_producto;


-- RF22, porcentaje pedidos recibidos a tiempo
CREATE OR REPLACE FUNCTION porcentaje_cumplimiento_proveedor(
    p_id_proveedor INTEGER
)
RETURNS NUMERIC
LANGUAGE sql
AS $$
SELECT
COALESCE(
    ROUND(
        100.0 *
        SUM(
            CASE
                WHEN fecha_recepcion <=
                     fecha_envio + (lead_time_dias || ' days')::INTERVAL
                THEN 1
                ELSE 0
            END
        )
        /
        NULLIF(COUNT(*),0),
        2
    ),
    0
)
FROM pedido pe
JOIN proveedor pr
    ON pr.id_proveedor = pe.id_proveedor
WHERE pe.id_proveedor = p_id_proveedor
AND pe.estado = 'recibido';
$$;

-- RF24, datos para dashboard
CREATE OR REPLACE VIEW dashboard_resumen AS
SELECT
(
    SELECT COUNT(*)
    FROM producto
    WHERE stock_actual <= stock_minimo
) AS productos_bajo_stock,

(
    SELECT COUNT(*)
    FROM alerta
    WHERE leida = FALSE
) AS alertas_pendientes,

(
    SELECT COUNT(*)
    FROM pedido
    WHERE estado = 'pendiente'
) AS pedidos_pendientes;

CREATE OR REPLACE FUNCTION validar_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.stock_actual < 0 THEN
        RAISE EXCEPTION 'Stock negativo no permitido';
    END IF;

    RETURN NEW;

END;
$$;

CREATE TRIGGER trg_validar_stock
BEFORE UPDATE
ON producto
FOR EACH ROW
EXECUTE FUNCTION validar_stock();


CREATE OR REPLACE FUNCTION alerta_bajo_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.stock_actual <= NEW.stock_minimo THEN

        INSERT INTO alerta(
            mensaje,
            fecha_creacion,
            leida,
            id_producto,
            tipo_alerta
        )
        VALUES(
            'Producto bajo stock',
            NOW(),
            FALSE,
            NEW.id_producto,
            'BajoStock'
        );

    END IF;

    RETURN NEW;

END;
$$;

CREATE TRIGGER trg_alerta_bajo_stock
AFTER UPDATE
ON producto
FOR EACH ROW
EXECUTE FUNCTION alerta_bajo_stock();
