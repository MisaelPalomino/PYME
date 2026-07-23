import { Warehouse, ChevronLeft, ChevronRight, X } from "lucide-react"
import { NavLink } from "react-router"
import * as navigation from "~/lib/navigation"
import { useAuth } from "~/context/AuthContext"
import { canAccessPage } from "~/lib/rbac"

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { session } = useAuth()
  const role = session?.usuario?.rol ?? ""
  const pages = navigation.pages.filter(
    (page) => !role || canAccessPage(role, page.url)
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} `}
      >
        {/* Logo */}
        <div className="flex min-h-[64px] items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Warehouse className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm leading-tight text-sidebar-foreground">
                PYME
              </p>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="ml-auto text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-x-hidden overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {pages.map(({ url, icon: Icon, label }) => (
              <li key={url}>
                <NavLink
                  to={url}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="hidden border-t border-sidebar-border p-2 lg:block">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
