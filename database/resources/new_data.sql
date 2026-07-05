--
-- Esto garantiza tener datos actuales para visualizaciones(30 o menos dias)
--

BEGIN;

UPDATE producto SET stock_actual = 8  WHERE id_producto = 3;   -- Pera (min 20)
UPDATE producto SET stock_actual = 4  WHERE id_producto = 6;   -- Queso (min 15)
UPDATE producto SET stock_actual = 0  WHERE id_producto = 9;   -- Bagel (min 20)
UPDATE producto SET stock_actual = 12 WHERE id_producto = 14;  -- Mantequilla (min 20)
UPDATE producto SET stock_actual = 15 WHERE id_producto = 18;  -- Pimienta (min 20)
UPDATE producto SET stock_actual = 5  WHERE id_producto = 22;  -- Lechuga (min 15)
UPDATE producto SET stock_actual = 3  WHERE id_producto = 28;  -- Filete de salmon (min 10)
UPDATE producto SET stock_actual = 10 WHERE id_producto = 33;  -- Garbanzos (min 25)
UPDATE producto SET stock_actual = 0  WHERE id_producto = 40;  -- Helado (min 15)
UPDATE producto SET stock_actual = 9  WHERE id_producto = 46;  -- Jabon Liquido (min 15)
UPDATE producto SET stock_actual = 2  WHERE id_producto = 53;  -- Pledge Furniture Polish (min 10)
UPDATE producto SET stock_actual = 1  WHERE id_producto = 59;  -- MacBook Air M1 (min 3)
UPDATE producto SET stock_actual = 2  WHERE id_producto = 63;  -- Sony WH-1000XM4 (min 5)
UPDATE producto SET stock_actual = 0  WHERE id_producto = 71;  -- Fitbit Charge 5 (min 5)
UPDATE producto SET stock_actual = 0  WHERE id_producto = 83;  -- HP Omen 30L (min 1)


INSERT INTO alerta (mensaje, fecha_creacion, leida, id_producto, tipo_alerta) VALUES
('Stock actual (8) por debajo del mínimo (20)',   '2026-07-05 09:12:00+00', false, 3,  'stock_bajo'),
('Stock actual (4) por debajo del mínimo (15)',   '2026-07-04 14:20:00+00', false, 6,  'stock_bajo'),
('Producto sin stock disponible',                 '2026-07-06 08:05:00+00', false, 9,  'sin_stock'),
('Stock actual (12) por debajo del mínimo (20)',  '2026-07-03 11:40:00+00', true,  14, 'stock_bajo'),
('Stock actual (15) igual al mínimo (20)',        '2026-07-02 16:55:00+00', true,  18, 'stock_bajo'),
('Stock actual (5) por debajo del mínimo (15)',   '2026-07-06 07:30:00+00', false, 22, 'stock_bajo'),
('Stock actual (3) por debajo del mínimo (10)',   '2026-07-05 19:10:00+00', false, 28, 'stock_bajo'),
('Stock actual (10) por debajo del mínimo (25)',  '2026-07-01 10:00:00+00', true,  33, 'stock_bajo'),
('Producto sin stock disponible',                 '2026-07-06 09:50:00+00', false, 40, 'sin_stock'),
('Stock actual (9) por debajo del mínimo (15)',   '2026-07-04 13:15:00+00', false, 46, 'stock_bajo'),
('Stock actual (2) por debajo del mínimo (10)',   '2026-07-03 08:45:00+00', true,  53, 'stock_bajo'),
('Stock actual (1) por debajo del mínimo (3)',    '2026-07-06 10:20:00+00', false, 59, 'stock_bajo'),
('Stock actual (2) por debajo del mínimo (5)',    '2026-07-05 15:05:00+00', false, 63, 'stock_bajo'),
('Producto sin stock disponible',                 '2026-07-06 11:00:00+00', false, 71, 'sin_stock'),
('Producto sin stock disponible',                 '2026-07-02 09:00:00+00', true,  83, 'sin_stock');


INSERT INTO movimiento_inventario (tipo_movimiento, fecha, cantidad, observaciones, id_producto, id_usuario) VALUES
('salida', '2026-06-08 10:15:00+00', 12, 'Venta mostrador', 1,  4),
('salida', '2026-06-09 15:40:00+00', 8,  'Venta mostrador', 2,  7),
('salida', '2026-06-10 09:20:00+00', 20, 'Venta mayorista', 4,  12),
('salida', '2026-06-11 17:05:00+00', 5,  'Venta mostrador', 7,  3),
('salida', '2026-06-12 12:30:00+00', 15, 'Venta mostrador', 10, 21),
('salida', '2026-06-13 14:50:00+00', 6,  'Venta mostrador', 13, 9),
('salida', '2026-06-15 11:10:00+00', 18, 'Venta mostrador', 17, 33),
('salida', '2026-06-16 16:25:00+00', 10, 'Venta mostrador', 20, 15),
('salida', '2026-06-17 09:45:00+00', 25, 'Venta mayorista', 26, 27),
('salida', '2026-06-18 13:00:00+00', 9,  'Venta mostrador', 30, 40),
('salida', '2026-06-19 10:35:00+00', 14, 'Venta mostrador', 34, 5),
('salida', '2026-06-20 15:20:00+00', 7,  'Venta mostrador', 37, 18),
('salida', '2026-06-21 12:00:00+00', 3,  'Venta mostrador', 41, 44),
('salida', '2026-06-22 09:15:00+00', 2,  'Venta e-commerce', 58, 6),
('salida', '2026-06-23 14:40:00+00', 4,  'Venta e-commerce', 60, 22),
('salida', '2026-06-24 10:55:00+00', 6,  'Venta mostrador', 62, 30),
('salida', '2026-06-25 16:10:00+00', 3,  'Venta e-commerce', 66, 11),
('salida', '2026-06-26 11:30:00+00', 2,  'Venta e-commerce', 70, 48),
('salida', '2026-06-27 13:45:00+00', 1,  'Venta e-commerce', 77, 26),
('salida', '2026-06-28 09:00:00+00', 10, 'Venta mostrador', 3,  1),
('salida', '2026-06-29 15:15:00+00', 6,  'Venta mostrador', 6,  14),
('salida', '2026-06-30 10:20:00+00', 4,  'Venta mostrador', 9,  38),
('salida', '2026-07-01 12:40:00+00', 8,  'Venta mostrador', 14, 42),
('salida', '2026-07-01 17:05:00+00', 5,  'Venta mostrador', 18, 19),
('salida', '2026-07-02 09:30:00+00', 7,  'Venta mostrador', 22, 25),
('salida', '2026-07-02 14:00:00+00', 4,  'Venta mostrador', 28, 8),
('salida', '2026-07-03 10:10:00+00', 3,  'Venta mostrador', 33, 31),
('salida', '2026-07-03 16:35:00+00', 2,  'Venta e-commerce', 40, 17),
('salida', '2026-07-04 09:50:00+00', 6,  'Venta mostrador', 46, 45),
('salida', '2026-07-04 13:25:00+00', 1,  'Venta e-commerce', 53, 29),
('salida', '2026-07-05 11:00:00+00', 1,  'Venta e-commerce', 59, 16),
('salida', '2026-07-05 15:45:00+00', 1,  'Venta e-commerce', 63, 37),
('salida', '2026-07-06 08:20:00+00', 2,  'Venta mostrador', 71, 24),
('salida', '2026-07-06 10:10:00+00', 5,  'Venta mostrador', 1,  10),
('salida', '2026-07-06 12:00:00+00', 3,  'Venta mostrador', 20, 39);


UPDATE pedido
SET fecha_creacion  = fecha_creacion  + INTERVAL '368 days',
    fecha_envio     = fecha_envio     + INTERVAL '368 days',
    fecha_recepcion = fecha_recepcion + INTERVAL '368 days';

COMMIT;
