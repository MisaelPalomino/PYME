import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { Link } from 'react-router';
import * as api from '~/api/login';
import * as dashboardAPI from '~/api/dashboard';

type DashboardAlert = dashboardAPI.Response["alertas_activas"][number];

type HeaderProps = {
  logout: () => void,
  onMenuClick: () => void,
  sidebarCollapsed: boolean,
  currentUser: api.LoginResponse,
};

export function Header({ onMenuClick, sidebarCollapsed, currentUser, logout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem("system_config");
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config && typeof config.notificationsEnabled === 'boolean') {
            setNotificationsEnabled(config.notificationsEnabled);
          }
        } catch (e) {
          console.error("Error parsing config in Header", e);
        }
      } else {
        setNotificationsEnabled(true);
      }
    };

    const fetchAlerts = async () => {
      const response = await dashboardAPI.dashboard();
      if (response.ok) {
        let readIds: string[] = [];
        const stored = localStorage.getItem('read_alerts');
        if (stored) {
          try {
            readIds = JSON.parse(stored) as string[];
          } catch (e) {
            console.error('Error parsing read_alerts in Header', e);
          }
        }

        const activeAlerts = (response.data.alertas_activas || []).filter(
          (al: DashboardAlert) => !readIds.includes(al.id_alerta.toString())
        );
        setAlerts(activeAlerts);
      }
    };

    loadConfig();
    fetchAlerts();

    window.addEventListener("config-updated", loadConfig);
    window.addEventListener("alerts-updated", fetchAlerts);
    window.addEventListener("storage", loadConfig);
    window.addEventListener("storage", fetchAlerts);

    const intervalId = setInterval(fetchAlerts, 30000);

    return () => {
      window.removeEventListener("config-updated", loadConfig);
      window.removeEventListener("alerts-updated", fetchAlerts);
      window.removeEventListener("storage", loadConfig);
      window.removeEventListener("storage", fetchAlerts);
      clearInterval(intervalId);
    };
  }, []);

  const unreadCount = alerts.length;

  const severityColors: Record<string, string> = {
    sin_stock: 'bg-destructive',
    stock_bajo: 'bg-yellow-500',
  };

  async function handleLogOut() {
    const response = await api.logout({
      access: currentUser.access,
      refresh: currentUser.refresh
    });

    if (response.ok) {
      logout();
    } else {
      toast.error(response.error);
    }
  }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center px-4 gap-4 transition-all duration-300
        ${sidebarCollapsed ? 'left-16' : 'left-64'}
        max-lg:left-0
      `}
    >
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Notifications */}
      {notificationsEnabled && (
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUser(false); }}
            className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Notificaciones</span>
                <span className="text-xs text-muted-foreground">{unreadCount} sin leer</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.slice(0, 6).map(alert => (
                    <Link
                      to="/alertas"
                      onClick={() => setShowNotifications(false)}
                      key={alert.id_alerta}
                      className="flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors block"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColors[alert.tipo_alerta] || 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">{alert.producto_nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.mensaje}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(alert.fecha_creacion).toLocaleDateString("es-PE", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No tienes notificaciones pendientes
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(!showUser); setShowNotifications(false); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs text-foreground leading-none">{currentUser.usuario.username}</p>
            <p className="text-xs text-muted-foreground">{currentUser.usuario.rol}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
        </button>

        {showUser && (
          <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-foreground">{currentUser.usuario.nombre}</p>
              <p className="text-xs text-muted-foreground">{currentUser.usuario.rol}</p>
              <p className="text-xs text-muted-foreground">{currentUser.usuario.email}</p>
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-accent/50 transition-colors" onClick={handleLogOut}>
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotifications || showUser) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifications(false); setShowUser(false); }} />
      )}
    </header>
  );
}
