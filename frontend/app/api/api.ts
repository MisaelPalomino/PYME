import axios from 'axios';
import type { Proveedor, Categoria, Producto, Movimiento } from '~/api/types';
import { mockProductos, mockCategorias, mockMovimientos } from '~/dataMock';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bases de datos simuladas en memoria para cuando el backend está fuera de línea (offline fallback)
let localProductos = [...mockProductos];
let localCategorias = [...mockCategorias];
let localMovimientos = [...mockMovimientos];
let localProveedores: Proveedor[] = [
  {
    id_proveedor: 1,
    nombre: "Dell Perú",
    contacto: "Juan Pérez",
    correo: "ventas@dell.com.pe",
    telefono: "+51 987 654 321",
    lead_time_dias: 5,
    activo: true
  },
  {
    id_proveedor: 2,
    nombre: "Logitech",
    contacto: "Ana Gómez",
    correo: "distribucion@logitech.com",
    telefono: "+51 912 345 678",
    lead_time_dias: 3,
    activo: true
  },
  {
    id_proveedor: 3,
    nombre: "HyperX",
    contacto: "Carlos Mendoza",
    correo: "carlos.m@hyperx.com",
    telefono: "+51 999 888 777",
    lead_time_dias: 7,
    activo: true
  }
];

export const productosAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    try {
      return await api.get<Producto[]>('/core/productos/', { params });
    } catch (e) {
      console.warn("[API Fallback] Backend offline. Usando base de datos simulada para Productos.");
      return { data: localProductos };
    }
  },
  getOne: async (id: number) => {
    try {
      return await api.get<Producto>(`/core/productos/${id}/`);
    } catch (e) {
      const prod = localProductos.find(p => p.id_producto === id);
      if (!prod) throw new Error("Producto no encontrado.");
      return { data: prod };
    }
  },
  create: async (data: any) => {
    try {
      return await api.post<Producto>('/core/productos/', data);
    } catch (e) {
      const newProduct: Producto = {
        id_producto: Math.max(...localProductos.map(p => p.id_producto), 0) + 1,
        nombre: data.nombre,
        sku: data.sku,
        descripcion: data.descripcion || '',
        precio: Number(data.precio),
        stock_actual: Number(data.stock_actual),
        stock_minimo: Number(data.stock_minimo),
        stock_maximo: Number(data.stock_maximo),
        id_categoria: Number(data.id_categoria),
        categoria_nombre: localCategorias.find(c => c.id_categoria === Number(data.id_categoria))?.nombre || 'General',
        id_proveedor_principal: Number(data.id_proveedor_principal),
        proveedor_nombre: localProveedores.find(p => p.id_proveedor === Number(data.id_proveedor_principal))?.nombre || 'Proveedor',
        estado: 'normal'
      };
      
      // Calcular estado inicial
      if (newProduct.stock_actual <= newProduct.stock_minimo) {
        newProduct.estado = 'critical';
      } else if (newProduct.stock_actual <= newProduct.stock_minimo * 1.5) {
        newProduct.estado = 'warning';
      }
      
      localProductos.push(newProduct);
      return { data: newProduct };
    }
  },
  update: async (id: number, data: any) => {
    try {
      return await api.put<Producto>(`/core/productos/${id}/`, data);
    } catch (e) {
      const index = localProductos.findIndex(p => p.id_producto === id);
      if (index === -1) throw new Error("Producto no encontrado.");
      
      const updatedProduct: Producto = {
        ...localProductos[index],
        nombre: data.nombre ?? localProductos[index].nombre,
        sku: data.sku ?? localProductos[index].sku,
        descripcion: data.descripcion ?? localProductos[index].descripcion,
        precio: data.precio ? Number(data.precio) : localProductos[index].precio,
        stock_actual: data.stock_actual ? Number(data.stock_actual) : localProductos[index].stock_actual,
        stock_minimo: data.stock_minimo ? Number(data.stock_minimo) : localProductos[index].stock_minimo,
        stock_maximo: data.stock_maximo ? Number(data.stock_maximo) : localProductos[index].stock_maximo,
        id_categoria: data.id_categoria ? Number(data.id_categoria) : localProductos[index].id_categoria,
        id_proveedor_principal: data.id_proveedor_principal ? Number(data.id_proveedor_principal) : localProductos[index].id_proveedor_principal,
      };

      updatedProduct.categoria_nombre = localCategorias.find(c => c.id_categoria === updatedProduct.id_categoria)?.nombre || updatedProduct.categoria_nombre;
      updatedProduct.proveedor_nombre = localProveedores.find(p => p.id_proveedor === updatedProduct.id_proveedor_principal)?.nombre || updatedProduct.proveedor_nombre;

      if (updatedProduct.stock_actual <= updatedProduct.stock_minimo) {
        updatedProduct.estado = 'critical';
      } else if (updatedProduct.stock_actual <= updatedProduct.stock_minimo * 1.5) {
        updatedProduct.estado = 'warning';
      } else {
        updatedProduct.estado = 'normal';
      }

      localProductos[index] = updatedProduct;
      return { data: updatedProduct };
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/core/productos/${id}/`);
    } catch (e) {
      localProductos = localProductos.filter(p => p.id_producto !== id);
      return { data: { success: true } };
    }
  },
};

export const categoriasAPI = {
  getAll: async () => {
    try {
      return await api.get<Categoria[]>('/core/categorias/');
    } catch (e) {
      console.warn("[API Fallback] Backend offline. Usando base de datos simulada para Categorías.");
      return { data: localCategorias };
    }
  },
  getOne: async (id: number) => {
    try {
      return await api.get<Categoria>(`/core/categorias/${id}/`);
    } catch (e) {
      const cat = localCategorias.find(c => c.id_categoria === id);
      if (!cat) throw new Error("Categoría no encontrada.");
      return { data: cat };
    }
  },
  create: async (data: Omit<Categoria, 'id_categoria'>) => {
    try {
      return await api.post<Categoria>('/core/categorias/', data);
    } catch (e) {
      const newCat: Categoria = {
        id_categoria: Math.max(...localCategorias.map(c => c.id_categoria), 0) + 1,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
      };
      localCategorias.push(newCat);
      return { data: newCat };
    }
  },
  update: async (id: number, data: Omit<Categoria, 'id_categoria'>) => {
    try {
      return await api.put<Categoria>(`/core/categorias/${id}/`, data);
    } catch (e) {
      const index = localCategorias.findIndex(c => c.id_categoria === id);
      if (index === -1) throw new Error("Categoría no encontrada.");
      const updatedCat: Categoria = {
        ...localCategorias[index],
        nombre: data.nombre,
        descripcion: data.descripcion,
      };
      localCategorias[index] = updatedCat;
      return { data: updatedCat };
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/core/categorias/${id}/`);
    } catch (e) {
      localCategorias = localCategorias.filter(c => c.id_categoria !== id);
      return { data: { success: true } };
    }
  },
};

export const proveedoresAPI = {
  getAll: async () => {
    try {
      return await api.get<Proveedor[]>('/core/proveedores/');
    } catch (e) {
      console.warn("[API Fallback] Backend offline. Usando base de datos simulada para Proveedores.");
      return { data: localProveedores };
    }
  },
  getOne: async (id: number) => {
    try {
      return await api.get<any>(`/core/proveedores/${id}/`);
    } catch (e) {
      const prov = localProveedores.find(p => p.id_proveedor === id);
      if (!prov) throw new Error("Proveedor no encontrado.");
      return { data: prov };
    }
  },
  create: async (data: any) => {
    try {
      return await api.post('/core/proveedores/', data);
    } catch (e) {
      const newProv: Proveedor = {
        id_proveedor: Math.max(...localProveedores.map(p => p.id_proveedor), 0) + 1,
        nombre: data.nombre,
        contacto: data.contacto,
        correo: data.correo,
        telefono: data.telefono,
        lead_time_dias: Number(data.lead_time_dias),
        activo: true
      };
      localProveedores.push(newProv);
      return { data: newProv };
    }
  },
  update: async (id: number, data: any) => {
    try {
      return await api.put(`/core/proveedores/${id}/`, data);
    } catch (e) {
      const index = localProveedores.findIndex(p => p.id_proveedor === id);
      if (index === -1) throw new Error("Proveedor no encontrado.");
      const updatedProv: Proveedor = {
        ...localProveedores[index],
        nombre: data.nombre ?? localProveedores[index].nombre,
        contacto: data.contacto ?? localProveedores[index].contacto,
        correo: data.correo ?? localProveedores[index].correo,
        telefono: data.telefono ?? localProveedores[index].telefono,
        lead_time_dias: data.lead_time_dias ? Number(data.lead_time_dias) : localProveedores[index].lead_time_dias,
      };
      localProveedores[index] = updatedProv;
      return { data: updatedProv };
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/core/proveedores/${id}/`);
    } catch (e) {
      localProveedores = localProveedores.filter(p => p.id_proveedor !== id);
      return { data: { success: true } };
    }
  },
};

export const movimientosAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    try {
      const res = await api.get<any[]>('/inventario/movimientos/', { params });
      const mapped = res.data.map(m => ({
        id: m.id_movimiento,
        producto_nombre: m.producto_nombre || '',
        tipo_movimiento: (m.tipo_movimiento === 'entrada' || m.tipo_movimiento === 'Entrada') ? 'Entrada' as const : 'Salida' as const,
        fecha: new Date(m.fecha),
        cantidad: m.cantidad,
        observaciones: m.observaciones || '',
        id_producto: m.id_producto,
      }));
      return { data: mapped };
    } catch (e) {
      console.warn("[API Fallback] Backend offline. Usando base de datos simulada para Movimientos.");
      return { data: localMovimientos };
    }
  },
  create: async (data: any) => {
    try {
      const backendData = {
        tipo_movimiento: data.tipo_movimiento.toLowerCase(),
        cantidad: Number(data.cantidad),
        observaciones: data.observaciones || '',
        id_producto: Number(data.id_producto),
        id_usuario: Number(data.id_usuario),
      };
      return await api.post('/inventario/movimientos/', backendData);
    } catch (e) {
      const targetProd = localProductos.find(p => p.id_producto === Number(data.id_producto));
      if (!targetProd) throw new Error("Producto no encontrado.");

      const cant = Number(data.cantidad);
      const isEntrada = data.tipo_movimiento.toLowerCase() === 'entrada';

      if (!isEntrada && targetProd.stock_actual < cant) {
        const mockError: any = new Error("No hay suficiente stock disponible para este producto.");
        mockError.response = {
          data: { error: "No hay suficiente stock disponible para este producto." }
        };
        throw mockError;
      }

      if (isEntrada) {
        targetProd.stock_actual += cant;
      } else {
        targetProd.stock_actual -= cant;
      }

      // Re-evaluar estado del producto
      if (targetProd.stock_actual <= targetProd.stock_minimo) {
        targetProd.estado = 'critical';
      } else if (targetProd.stock_actual <= targetProd.stock_minimo * 1.5) {
        targetProd.estado = 'warning';
      } else {
        targetProd.estado = 'normal';
      }

      const newMov: Movimiento = {
        id: Math.max(...localMovimientos.map(m => m.id), 0) + 1,
        producto_nombre: targetProd.nombre,
        tipo_movimiento: isEntrada ? 'Entrada' : 'Salida',
        fecha: new Date(),
        cantidad: cant,
        observaciones: data.observaciones || '',
        id_producto: targetProd.id_producto,
      };

      localMovimientos.unshift(newMov);
      return { data: newMov };
    }
  }
};
