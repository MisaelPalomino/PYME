import {
  LayoutDashboard,
  Package,
  Tag,
  ArrowLeftRight,
  Warehouse,
  Brain,
  Truck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  url: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export const navigation: NavItem[] = [
  { url: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { url: "/productos", icon: Package, label: "Productos" },
  { url: "/categorias", icon: Tag, label: "Categorías" },
  { url: "/proveedores", icon: Truck, label: "Proveedores" },
  { url: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
  { url: "/inventario", icon: Warehouse, label: "Inventario" },
  { url: "/predicciones", icon: Brain, label: "Predicciones" },
];