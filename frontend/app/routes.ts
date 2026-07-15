import { type RouteConfig, route, layout } from "@react-router/dev/routes"
import * as navigation from "./lib/navigation";

export default [
  layout("layouts/auth-layout.tsx", [route(navigation.login.url, navigation.login.path)]),

  layout("layouts/app-layout.tsx", navigation.pages.map(x => route(x.url, x.path)))
] satisfies RouteConfig;
