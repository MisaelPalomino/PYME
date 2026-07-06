import { type RouteConfig, route, layout } from "@react-router/dev/routes"
import { navigation } from "./lib/navigation";

export default [
  layout("layouts/auth-layout.tsx", [route("login", "routes/login.tsx")]),

  layout("layouts/app-layout.tsx", navigation.map(x => route(x.url, x.path)))
] satisfies RouteConfig;
