import { useQuery } from '@tanstack/react-query'
import { Link2, Server, ShieldCheck, Waypoints } from 'lucide-react'
import { getDashboardSummary } from '@/modules/dashboard/services/dashboard-service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const badgeForStatus = (value: string) => {
  const normalized = value.toLowerCase()

  if (['healthy', 'ok', 'up', 'online', 'active'].some((entry) => normalized.includes(entry))) {
    return { variant: 'secondary' as const, className: 'bg-emerald-500/18 text-emerald-300 ring-1 ring-emerald-500/25' }
  }

  if (['degraded', 'warning', 'unknown'].some((entry) => normalized.includes(entry))) {
    return { variant: 'outline' as const, className: 'border-amber-500/35 bg-amber-500/12 text-amber-300' }
  }

  return { variant: 'destructive' as const, className: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20' }
}

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: queryKeys.dashboardSummary, queryFn: getDashboardSummary })

  if (summaryQuery.isPending) {
    return <LoadingState rows={4} />
  }

  if (summaryQuery.error instanceof ApiError && summaryQuery.error.code === 'FORBIDDEN') {
    return <PermissionDeniedState />
  }

  if (summaryQuery.isError) {
    return <ErrorState description="Unable to load dashboard summary from backend." onRetry={() => summaryQuery.refetch()} />
  }

  const summary = summaryQuery.data

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-2xl font-semibold">System Summary</h3>
        <p className="text-sm text-muted-foreground">High-level health and exposure visibility.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge {...badgeForStatus(summary.backendHealth)}>{summary.backendHealth}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tunnel Status</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge {...badgeForStatus(summary.tunnelStatus)}>{summary.tunnelStatus}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
            <Waypoints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalContainers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Hostnames</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalPublicHostnames}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
