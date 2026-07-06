import { Outlet } from "react-router"
import { useState } from "react";
import { Sidebar } from "~/components/layout/Sidebar";
import { Header } from "~/components/layout/Header";
import { useAuth } from "~/context/AuthContext";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  console.log("PINGAAA");

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
        <Header
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          currentUser={user ? { name: user.nombre, role: user.rol } : { name: "Invitado", role: "Sin rol" }}
        />

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
