import {
    ArrowLeftRight,
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  Warehouse,
  Brain,
  ShoppingCart,
  BarChart3,
  Users,
  type LucideIcon
} from "lucide-react";

type NavigationItem = {
  url: string
  path: string,
  label: string,
  icon: LucideIcon
};

// Sirve para mostrar (o no) secciones del sistema.
// @see frontend/app/components/Sidebar 
export const navigation: NavigationItem[] = [
  {
    url: "/",
    path: "routes/home.tsx",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    url: "productos",
    path: "routes/productos.tsx",
    label: "Productos",
    icon: Package,
  },
  {
    url: "categorias",
    path: "routes/categorias.tsx",
    label: "Categorías",
    icon: Tag,
  },
  {
    url: "proveedores",
    path: "routes/proveedores.tsx",
    label: "Proveedores",
    icon: Truck,
  },
  {
    url: "pedidos",
    path: "routes/pedidos.tsx",
    label: "Pedidos",
    icon: ShoppingCart,
  },
  {
    url: "informes",
    path: "routes/informes.tsx",
    label: "Informes",
    icon: BarChart3,
  },
  {
    url: "usuarios",
    path: "routes/usuarios.tsx",
    label: "Usuarios",
    icon: Users,
  },
  {
    url: "movimientos",
    path: "routes/movimientos.tsx",
    label: "Movimientos",
    icon: ArrowLeftRight,
  },
  {
    url: "inventario",
    path: "routes/inventario.tsx",
    label: "Inventario",
    icon: Warehouse,
  },
  {
    url: "predicciones",
    path: "routes/predicciones.tsx",
    label: "Predicciones",
    icon: Brain,
  }
];
