import { useState } from 'react'
import { Activity, Boxes, ChartNoAxesCombined, Link2, LogOut, Menu, Shield, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: ChartNoAxesCombined },
  { to: '/containers', label: 'Containers', icon: Boxes },
  { to: '/exposures', label: 'Exposures', icon: Link2 },
  { to: '/audit', label: 'Audit', icon: Activity },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
  )
}

type SidebarContentProps = {
  user: { email?: string | null } | null
  logout: () => void
  onNavClick?: () => void
}

function SidebarContent({ user, logout, onNavClick }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-5">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-sidebar-foreground">TunnelDeck</span>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink className={navLinkClass} end={item.to === '/'} onClick={onNavClick} to={item.to}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? 'Unknown'}</p>
          </div>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={logout}
            title="Logout"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const segment = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replace(/^(.)/, (c) => c.toUpperCase())

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent logout={logout} user={user} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-black"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-56 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-14 shrink-0 items-center justify-end px-4">
              <button
                className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                onClick={() => setSidebarOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent logout={logout} onNavClick={() => setSidebarOpen(false)} user={user} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4 lg:px-6">
          <button
            className="mr-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium text-foreground">{segment}</span>

          <div className="ml-auto lg:hidden">
            <Button className="gap-1.5 text-xs" onClick={logout} size="sm" variant="ghost">
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
