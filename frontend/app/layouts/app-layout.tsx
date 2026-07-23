import { Navigate, Outlet, useLocation } from "react-router"
import { useState, useEffect } from "react";
import { Sidebar } from "~/components/layout/Sidebar";
import { Header } from "~/components/layout/Header";
import { useAuth } from "~/context/AuthContext";
import * as navigation from "~/lib/navigation";
import { canAccessPage } from "~/lib/rbac";
import { toast } from "sonner";

export default function AppLayout() {
  const { session, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Inactivity auto-logout
  useEffect(() => {
    if (!session) return;

    let timerId: ReturnType<typeof setTimeout>;
    let timeoutMinutes = 30;

    const handleLogout = () => {
      logout();
      toast.warning("Sesión cerrada por inactividad");
    };

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      const timeoutMs = timeoutMinutes * 60 * 1000;
      timerId = setTimeout(handleLogout, timeoutMs);
    };

    const loadConfig = () => {
      const savedConfig = localStorage.getItem("system_config");
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config && typeof config.sessionTimeout === 'number') {
            timeoutMinutes = config.sessionTimeout;
          }
        } catch (e) {
          console.error("Error parsing config in AppLayout", e);
        }
      }
      resetTimer();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click"
    ];

    // Load configuration and initialize timer
    loadConfig();

    // Attach activity trackers
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Attach listeners for dynamic config changes
    window.addEventListener("config-updated", loadConfig);
    window.addEventListener("storage", loadConfig);

    return () => {
      if (timerId) clearTimeout(timerId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener("config-updated", loadConfig);
      window.removeEventListener("storage", loadConfig);
    };
  }, [session, logout]);

  if (!session) {
    return <Navigate to={navigation.login.url} replace />
  }

  const pageKey = location.pathname.replace(/^\//, "");
  if (pageKey && !canAccessPage(session.usuario.rol, pageKey)) {
    toast.error("No tienes acceso a esta página");
    return <Navigate to={navigation.dashboard_url} replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>

        <Header
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          currentUser={session}
          logout={logout}
        />
        <main className="pt-16 min-h-screen">
          <div className="px-4 py-6 max-w-[100vw] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
  /*
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>

        <main className="pt-16 min-h-screen">
          <div className="px-4 py-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </div>
  );*/
}
