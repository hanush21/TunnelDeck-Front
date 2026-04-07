import { useQuery } from '@tanstack/react-query'
import { Boxes, Gauge, Link2, RefreshCw, ShieldCheck } from 'lucide-react'
import { getDashboardSummary } from '@/modules/dashboard/services/dashboard-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const badgeForStatus = (value: string) => {
  const normalized = value.toLowerCase()

  if (['healthy', 'ok', 'up', 'online', 'active'].some((entry) => normalized.includes(entry))) {
    return { variant: 'secondary' as const, className: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20' }
  }

  if (['degraded', 'warning', 'unknown'].some((entry) => normalized.includes(entry))) {
    return { variant: 'outline' as const, className: 'border-amber-500/30 bg-amber-500/10 text-amber-400' }
  }

  return { variant: 'destructive' as const, className: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20' }
}

function StatusDot({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  if (['healthy', 'ok', 'up', 'online', 'active'].some((entry) => normalized.includes(entry))) {
    return <span className="h-2 w-2 rounded-full bg-emerald-400" />
  }

  if (['degraded', 'warning', 'unknown'].some((entry) => normalized.includes(entry))) {
    return <span className="h-2 w-2 rounded-full bg-amber-400" />
  }

  return <span className="h-2 w-2 rounded-full bg-red-400" />
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">System Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Containers, exposures, and tunnel health status.</p>
        </div>
        <Button
          className="gap-2 text-xs"
          disabled={summaryQuery.isFetching}
          onClick={() => summaryQuery.refetch()}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${summaryQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cloudflared Status</CardTitle>
            <div className="rounded-md border border-border bg-muted/50 p-1.5">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusDot status={summary.cloudflaredStatus} />
              <Badge {...badgeForStatus(summary.cloudflaredStatus)}>{summary.cloudflaredStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Config:{' '}
              <span className={summary.cloudflaredConfigExists ? 'text-emerald-400' : 'text-red-400'}>
                {summary.cloudflaredConfigExists ? 'present' : 'missing'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Containers</CardTitle>
            <div className="rounded-md border border-border bg-muted/50 p-1.5">
              <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {summary.runningContainers}
              <span className="ml-1.5 text-lg font-normal text-muted-foreground">/ {summary.totalContainers}</span>
            </p>
            <p className="text-xs text-muted-foreground">running / total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exposures</CardTitle>
            <div className="rounded-md border border-border bg-muted/50 p-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {summary.enabledExposures}
              <span className="ml-1.5 text-lg font-normal text-muted-foreground">/ {summary.totalExposures}</span>
            </p>
            <p className="text-xs text-muted-foreground">enabled / total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tunnel Ready</CardTitle>
            <div className="rounded-md border border-border bg-muted/50 p-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${summary.cloudflaredActive ? 'bg-emerald-400' : 'bg-red-400'}`}
              />
              <Badge
                className={
                  summary.cloudflaredActive
                    ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                    : undefined
                }
                variant={summary.cloudflaredActive ? 'secondary' : 'destructive'}
              >
                {summary.cloudflaredActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Cloudflared tunnel process</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
