import { LayoutDashboard, Package, Tag, Truck, type LucideIcon } from "lucide-react";

type NavigationItem = {
  url: string
  path: string,
  label: string,
  icon: LucideIcon
};

// Sirve para mostrar (o no) secciones del sistema.
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
  }
];
