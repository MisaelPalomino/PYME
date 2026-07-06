export type Movimiento = {
  id: number,
  producto_nombre: string,
  tipo_movimiento: "Entrada" | "Salida",
  fecha: Date,
  cantidad: number,
  observaciones: string,
  id_producto?: number,
}

export type Proveedor = {
  id_proveedor: number,
  nombre: string,
  contacto: string,
  correo: string,
  telefono: string,
  lead_time_dias: number,
  activo: boolean,
  porcentaje_cumplimiento: number,
  categorias: {
    nombre: string,
    id_categoria: number
  }[]
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

export type Dashboard = {
  ventas_diarias: {
    dia: Date,
    monto: number,
    unidades: number,
  }[],
  resumen: {
    ventas_mes: {
      monto: number,
      unidades: number
    },
    ventas_semana: {
      monto: number,
      unidades: number
    },
    alertas_totales: number,
    total_productos: number,
    alertas_no_leidas: number, // TODO: Does this work?
    pedidos_pendientes: number,
    pedidos_en_transito: number,
    productos_sin_stock: number,
    productos_bajo_stock: number,
    notificaciones_no_leidas: number,
  },
  generado_en: Date,
  stock_critico: {
    sku: string,
    nombre: string,
    categoria: string,
    id_producto: number,
    estado_stock: string,
    stock_actual: number,
    stock_maximo: number,
    stock_minimo: number,
    lead_time_dias: number,
    proveedor_principal: string
  }[],
  alertas_activas: {
    sku: string,
    mensaje: string,
    id_alerta: number,
    id_producto: number,
    tipo_alerta: "sin_stock" | "stock_bajo",
    stock_actual: number,
    stock_minimo: number,
    fecha_creacion: Date,
    producto_nombre: string
  }[]
};

export type DetallePedido = {
  id_detalle?: number;
  id_producto: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
};

export type HistorialProducto = {
  id_producto: number,
  historial: {
    fecha: Date,
    tipo_movimiento: "salida" | "entrada",
    cantidad: number,
    observaciones: string,
  }[]
};

export type InventarioProducto = {
  id_producto: number,
  nombre: string,
  stock_actual: number,
  estado_stock: "Normal" | "Advertencia" | "Crítico"
};

export type Inventario = {
  total: number,
  stock_agotado: number,
  stock_critico: number,
  stock_normal: number,
  productos: InventarioProducto[]
};

export type LoginAPIData = {
  username: string,
  password: string,
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
