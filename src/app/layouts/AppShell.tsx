import { Activity, Boxes, ChartNoAxesCombined, Link2, LogOut } from 'lucide-react'
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

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1460px] gap-4 px-4 py-4 lg:gap-6 lg:px-6 lg:py-6">
      <aside className="hidden w-72 shrink-0 flex-col rounded-2xl border border-border/80 bg-sidebar/85 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex">
        <div className="mb-8 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">TunnelDeck</p>
          <h1 className="text-xl font-semibold text-sidebar-foreground">Control Panel</h1>
          <p className="text-xs text-muted-foreground">Secure container exposure management</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
              key={item.to}
              to={item.to}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="uppercase tracking-wide">Signed in as</p>
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.email ?? 'Unknown user'}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="rounded-2xl border border-border/80 bg-card/80 p-3 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Current route</p>
              <h2 className="text-lg font-semibold capitalize text-foreground">
                {location.pathname === '/' ? 'dashboard' : location.pathname.slice(1)}
              </h2>
            </div>
            <Button className="gap-2 self-start lg:self-auto" onClick={logout} variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-lg border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground',
                    isActive ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : 'bg-card/60',
                  )
                }
                key={item.to}
                to={item.to}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="min-h-[calc(100svh-7rem)] rounded-2xl border border-border/80 bg-card/78 p-4 shadow-xl shadow-black/20 backdrop-blur-xl md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
