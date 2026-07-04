export type Movimiento = {
  id: number,
  producto_nombre: string,
  tipo_movimiento: "Entrada" | "Salida",
  fecha: Date,
  cantidad: number,
  observaciones: string,
}

export type Proveedor = {
  id_proveedor: number,
  nombre: string,
  contacto: string,
  correo: string,
  telefono: string,
  lead_time_dias: number,
  activo: boolean,
}

export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export type Producto = {
  id_producto: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  estado: "normal" | "warning" | "critical";
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  categoria_nombre: string;
  id_proveedor_principal: number;
  proveedor_nombre: string;
}
