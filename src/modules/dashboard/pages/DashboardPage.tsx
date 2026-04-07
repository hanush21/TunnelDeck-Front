import { useQuery } from '@tanstack/react-query'
import { Boxes, Gauge, Link2, ShieldCheck } from 'lucide-react'
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
        <p className="text-sm text-muted-foreground">Containers, exposures and cloudflared health from backend.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloudflared Status</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge {...badgeForStatus(summary.cloudflaredStatus)}>{summary.cloudflaredStatus}</Badge>
            <p className="text-xs text-muted-foreground">Config: {summary.cloudflaredConfigExists ? 'present' : 'missing'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary.runningContainers}
              <span className="ml-1 text-base text-muted-foreground">/ {summary.totalContainers}</span>
            </p>
            <p className="text-xs text-muted-foreground">running / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exposures</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary.enabledExposures}
              <span className="ml-1 text-base text-muted-foreground">/ {summary.totalExposures}</span>
            </p>
            <p className="text-xs text-muted-foreground">enabled / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tunnel Ready</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              className={summary.cloudflaredActive ? 'bg-emerald-500/18 text-emerald-300 ring-1 ring-emerald-500/25' : undefined}
              variant={summary.cloudflaredActive ? 'secondary' : 'destructive'}
            >
              {summary.cloudflaredActive ? 'yes' : 'no'}
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
