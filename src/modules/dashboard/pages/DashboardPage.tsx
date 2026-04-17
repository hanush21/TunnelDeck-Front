import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { getDashboardSummary } from '@/modules/dashboard/services/dashboard-service'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const badgeForStatus = (value: string) => {
  const normalized = value.toLowerCase()

  if (['healthy', 'ok', 'up', 'online', 'active'].some((entry) => normalized.includes(entry))) {
    return { variant: 'secondary' as const, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
  }

  if (['degraded', 'warning', 'unknown'].some((entry) => normalized.includes(entry))) {
    return { variant: 'outline' as const, className: 'bg-amber-50 text-amber-700 border border-amber-200' }
  }

  return { variant: 'destructive' as const, className: 'bg-red-50 text-red-700 border border-red-200' }
}

function StatusDot({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  if (['healthy', 'ok', 'up', 'online', 'active'].some((entry) => normalized.includes(entry))) {
    return <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  }

  if (['degraded', 'warning', 'unknown'].some((entry) => normalized.includes(entry))) {
    return <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
  }

  return <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-medium text-foreground">Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Containers, exposures, and tunnel health.</p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-50"
          disabled={summaryQuery.isFetching}
          onClick={() => summaryQuery.refetch()}
          type="button"
        >
          <RefreshCw className={`h-3 w-3 ${summaryQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Cloudflared</p>
          <div className="mt-3 flex items-center gap-2">
            <StatusDot status={summary.cloudflaredStatus} />
            <Badge {...badgeForStatus(summary.cloudflaredStatus)}>{summary.cloudflaredStatus}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Config{' '}
            <span className={summary.cloudflaredConfigExists ? 'text-emerald-500' : 'text-red-500'}>
              {summary.cloudflaredConfigExists ? 'present' : 'missing'}
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Containers</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
            {summary.runningContainers}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">/ {summary.totalContainers}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">running / total</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Exposures</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
            {summary.enabledExposures}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">/ {summary.totalExposures}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">enabled / total</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Tunnel</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${summary.cloudflaredActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <Badge
              className={
                summary.cloudflaredActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }
              variant={summary.cloudflaredActive ? 'secondary' : 'destructive'}
            >
              {summary.cloudflaredActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Cloudflared process</p>
        </div>
      </div>
    </div>
  )
}
