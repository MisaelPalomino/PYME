import {
  Warehouse,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { navigation } from '~/lib/navigation';

type SidebarProps = {
  collapsed: boolean,
  onToggle: () => void,
  mobileOpen: boolean,
  onMobileClose: () => void,
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border min-h-[64px]">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Warehouse className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm leading-tight text-sidebar-foreground truncate">PYME</p>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {
              navigation.map(({ url, icon: Icon, label }) => (
                <li key={url}>
                  <NavLink
                    to={url}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
                    ${isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    ${collapsed ? 'justify-center' : ''}`
                    }
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </li>
              ))
            }
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border hidden lg:block">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
