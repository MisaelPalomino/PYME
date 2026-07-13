import { Navigate, Outlet } from "react-router"
import { useState } from "react";
import { Sidebar } from "~/components/layout/Sidebar";
import { Header } from "~/components/layout/Header";
import { useAuth } from "~/context/AuthContext";
import * as navigation from "~/lib/navigation";

export default function AppLayout() {
  const { session, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session) {
    return <Navigate to={navigation.login.url} replace />
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
