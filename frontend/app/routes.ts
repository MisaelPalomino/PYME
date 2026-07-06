import { type RouteConfig, route } from "@react-router/dev/routes"
import { navigation } from "./lib/navigation";

export default [route("/login", "routes/login.tsx"), ...navigation.map(x => route(x.url, x.path))] satisfies RouteConfig;
