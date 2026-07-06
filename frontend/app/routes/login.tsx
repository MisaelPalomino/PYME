import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

type HeaderProps = {
  onMenuClick: () => void,
  sidebarCollapsed: boolean,
  currentUser: { name: string; role: string }
};

export async function loader() {
  return {};
}

export default function Login({ onMenuClick, sidebarCollapsed, currentUser }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUser(false);
    navigate("/");
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-destructive',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

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
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowUser(false);
          }}
          className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm text-foreground">Notificaciones</span>
              <span className="text-xs text-muted-foreground">$unreadCount sin leer</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {/* Aquí irán las notificaciones */}
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowUser(!showUser);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs text-foreground leading-none">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUser.role}
            </p>
          </div>

          <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
        </button>

        {showUser && (
          <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-foreground">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentUser.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-accent/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotifications || showUser) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUser(false);
          }}
        />
      )}
    </header>
  );
}
