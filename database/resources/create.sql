CREATE TYPE MODELO_ESTADO AS ENUM ('entrenado', 'sin_datos', 'desactualizado');

CREATE TABLE IF NOT EXISTS "modelo_ia" (
	"id_modelo" serial NOT NULL,
	"id_producto" integer NOT NULL,
	"fecha_entrenamiento" timestamp with time zone NOT NULL,
	"mae" numeric(10,0) NOT NULL,
	"mape" numeric(10,0) NOT NULL,
	"estado" MODELO_ESTADO NOT NULL,
	PRIMARY KEY ("id_modelo")
);

ALTER TABLE "modelo_ia" ADD CONSTRAINT "modeloIA_fk1" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto");

CREATE INDEX idx_modelo_producto
ON "modelo_ia"(id_producto);