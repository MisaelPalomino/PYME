CREATE TYPE USER_ROLE AS ENUM ('Administrador', 'Gerente', 'Almacenero', 'Comprador');

CREATE TABLE IF NOT EXISTS "usuario" (
	"id_usuario" serial NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"activo" boolean NOT NULL,
	"fecha_creacion" timestamp with time zone NOT NULL,
	"rol" USER_ROLE NOT NULL,
	PRIMARY KEY ("id_usuario")
);
CREATE TABLE IF NOT EXISTS "categoria" (
	"id_categoria" integer NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text NOT NULL,
	PRIMARY KEY ("id_categoria")
);
CREATE TABLE IF NOT EXISTS "producto" (
	"id_producto" integer NOT NULL,
	"descripcion" text NOT NULL,
	"stock_actual" integer NOT NULL,
	"stock_minimo" integer NOT NULL,
	"stock_maximo" integer NOT NULL,
	"precio" numeric(10,0) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"id_categoria" integer NOT NULL,
	"id_proveedor_principal" integer NOT NULL,
	PRIMARY KEY ("id_producto")
);
CREATE TABLE IF NOT EXISTS "proveedor" (
	"id_proveedor" integer NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"contacto" varchar(255) NOT NULL,
	"correo" varchar(255) NOT NULL,
	"telefono" varchar(255) NOT NULL,
	"lead_time_dias" integer NOT NULL,
	"activo" boolean NOT NULL,
	PRIMARY KEY ("id_proveedor")
);
CREATE TABLE IF NOT EXISTS "movimiento_inventario" (
	"id_movimiento" integer NOT NULL,
	"tipo_movimiento" varchar(255) NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"cantidad" integer NOT NULL,
	"observaciones" text NOT NULL,
	"id_producto" integer NOT NULL,
	"id_usuario" integer NOT NULL,
	PRIMARY KEY ("id_movimiento")
);
CREATE TABLE IF NOT EXISTS "pedido" (
	"id_pedido" integer NOT NULL,
	"fecha_envio" timestamp,
	"fecha_recepcion" timestamp,
	"id_proveedor" integer NOT NULL,
	"id_usuario" integer NOT NULL,
	"estado" varchar(255) NOT NULL,
	"fecha_creacion" timestamp with time zone NOT NULL,
	PRIMARY KEY ("id_pedido")
);
CREATE TABLE IF NOT EXISTS "detalle_pedido" (
	"id_detalle" integer NOT NULL,
	"precio_unitario" decimal NOT NULL,
	"id_pedido" integer NOT NULL,
	"id_producto" integer NOT NULL,
	"cantidad" integer NOT NULL,
	PRIMARY KEY ("id_detalle")
);
CREATE TABLE IF NOT EXISTS "alerta" (
	"id_alerta" integer NOT NULL,
	"mensaje"text NOT NULL,
	"fecha_creacion" timestamp with time zone NOT NULL,
	"leida" boolean NOT NULL,
	"id_producto" integer NOT NULL,
	"tipo_alerta" varchar(255) NOT NULL,
	PRIMARY KEY ("id_alerta")
);
CREATE TABLE IF NOT EXISTS "notificacion" (
	"id_notificacion" integer NOT NULL,
	"id_usuario" integer NOT NULL,
	"fecha_creacion" timestamp with time zone NOT NULL,
	"leida" boolean NOT NULL,
	"mensaje" text NOT NULL,
	"titulo" varchar(255) NOT NULL,
	PRIMARY KEY ("id_notificacion")
);
CREATE TABLE IF NOT EXISTS "prediccion" (
	"id_prediccion" integer NOT NULL,
	"id_producto" integer NOT NULL,
	"fecha_generacion" timestamp with time zone NOT NULL,
	"horizonte_dias" integer NOT NULL,
	"demanda_predicha" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id_prediccion")
);

CREATE TYPE MODELO_ESTADO AS ENUM ('Entrenado', 'Sin_datos', 'Desactualizado');

CREATE TABLE IF NOT EXISTS "modeloIA" (
	"id_modelo" integer NOT NULL,
	"id_producto" integer NOT NULL,
	"fecha_entrenamiento" timestamp with time zone NOT NULL,
	"mae" numeric(10,0) NOT NULL,
	"mape" numeric(10,0) NOT NULL,
	"estado" MODELO_ESTADO NOT NULL,
	PRIMARY KEY ("id_modelo")
);
ALTER TABLE "producto" ADD CONSTRAINT "producto_fk8" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria");
ALTER TABLE "producto" ADD CONSTRAINT "producto_fk9" FOREIGN KEY ("id_proveedor_principal") REFERENCES "proveedor"("id_proveedor");
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_fk5" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_fk6" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario");
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_fk3" FOREIGN KEY ("id_proveedor") REFERENCES "proveedor"("id_proveedor");
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_fk4" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario");
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_fk2" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido");
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_fk3" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_fk4" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_fk1" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario");
ALTER TABLE "prediccion" ADD CONSTRAINT "prediccion_fk1" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");
ALTER TABLE "modeloIA" ADD CONSTRAINT "modeloIA_fk1" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");
