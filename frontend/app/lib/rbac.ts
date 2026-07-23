export type Rol = "Administrador" | "Gerente" | "Almacenero" | "Comprador"

export const ROLE_PAGES: Record<Rol, string[]> = {
  Administrador: [
    "dashboard",
    "productos",
    "categorias",
    "proveedores",
    "pedidos",
    "informes",
    "usuarios",
    "movimientos",
    "inventario",
    "predicciones",
    "alertas",
    "configuracion",
  ],
  Gerente: [
    "dashboard",
    "inventario",
    "predicciones",
    "alertas",
    "pedidos",
    "informes",
    "proveedores",
  ],
  Almacenero: [
    "dashboard",
    "productos",
    "movimientos",
    "inventario",
    "alertas",
  ],
  Comprador: ["dashboard", "inventario", "alertas", "pedidos", "proveedores"],
}

export function canAccessPage(rol: string, pageUrl: string): boolean {
  const normalizedRole = rol as Rol
  const allowed = ROLE_PAGES[normalizedRole]
  if (!allowed) return false
  return allowed.includes(pageUrl)
}
