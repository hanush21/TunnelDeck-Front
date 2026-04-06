import { Activity, Boxes, ChartNoAxesCombined, Link2, LogOut } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

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
    <div className="mx-auto flex min-h-svh w-full max-w-[1400px] gap-6 p-4 md:p-6">
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border bg-card/90 p-4 shadow-sm backdrop-blur-sm lg:flex">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">TunnelDeck</p>
          <h1 className="mt-2 text-xl font-semibold">Admin Console</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
                  isActive ? 'bg-primary/12 text-primary' : 'hover:bg-secondary hover:text-foreground',
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

        <div className="mt-auto rounded-md bg-secondary/75 p-3 text-xs text-muted-foreground">
          Signed in as
          <p className="mt-1 truncate text-sm font-medium text-foreground">{user?.email ?? 'Unknown user'}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="flex items-center justify-between rounded-xl border bg-card/90 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Route</p>
            <h2 className="text-lg font-semibold capitalize">{location.pathname === '/' ? 'dashboard' : location.pathname.slice(1)}</h2>
          </div>
          <Button className="gap-2" onClick={logout} variant="outline">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        <main className="min-h-[calc(100svh-5rem)] rounded-xl border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
