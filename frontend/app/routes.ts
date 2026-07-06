import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/login.tsx"),  // ← Login es la página principal
  route("registro", "routes/registro.tsx"),
  route("dashboard", "routes/home.tsx"),
  route("productos", "routes/productos.tsx"),
  route("categorias", "routes/categorias.tsx"),
  route("proveedores", "routes/proveedores.tsx"),
  route("movimientos", "routes/movimientos.tsx"),
  route("inventario", "routes/inventario.tsx"),
  route("predicciones", "routes/predicciones.tsx"),
] satisfies RouteConfig