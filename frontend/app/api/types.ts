export type Movimiento = {
  id: number,
  producto_nombre: string,
  tipo_movimiento: "Entrada" | "Salida",
  fecha: Date,
  cantidad: number,
  observaciones: string,
  id_producto?: number,
}





export type DetallePedido = {
  id_detalle?: number;
  id_producto: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
};


export type Pedido = {
  id_pedido: number;
  id_proveedor: number;
  proveedor_nombre?: string;
  id_usuario: number;
  usuario_nombre?: string;
  estado: "pendiente" | "enviado" | "recibido" | "cancelado";
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_recepcion?: string;
  fecha_esperada?: string;
  detalles: DetallePedido[];
  total: string | number;
};

export type Prediccion = {
  producto_id: number,
  producto_nombre: string,
  sku: string,
  stock_actual: number,
  prediccion_7d: number,
  prediccion_14d: number,
  prediccion_21d: number
};
