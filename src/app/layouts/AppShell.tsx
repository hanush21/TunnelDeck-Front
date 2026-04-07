import { useState } from 'react'
import { Activity, Boxes, ChartNoAxesCombined, ChevronRight, Link2, LogOut, Menu, Shield, User, X } from 'lucide-react'
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
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/15 text-primary'
      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-sidebar-foreground">TunnelDeck</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Control Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Navigation
        </p>
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

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">Signed in as</p>
            <p className="truncate text-xs font-medium text-sidebar-foreground">{user?.email ?? 'Unknown'}</p>
          </div>
          <Button className="h-8 w-8 shrink-0 text-muted-foreground" onClick={logout} size="icon" title="Logout" variant="ghost">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
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
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent logout={logout} user={user} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-end border-b border-sidebar-border px-4">
              <Button onClick={() => setSidebarOpen(false)} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent logout={logout} onNavClick={() => setSidebarOpen(false)} user={user} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-6">
          <Button
            className="mr-3 h-8 w-8 text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">TunnelDeck</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="font-medium text-foreground">{segment}</span>
          </nav>

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
