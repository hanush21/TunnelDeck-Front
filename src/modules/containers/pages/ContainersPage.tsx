import { useQuery } from '@tanstack/react-query'
import { getContainers } from '@/modules/containers/services/containers-service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/state/EmptyState'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const statusVariant = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('up') || normalized.includes('running')) {
    return { variant: 'secondary' as const, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
  }

  if (normalized.includes('paused') || normalized.includes('restarting')) {
    return { variant: 'outline' as const, className: 'bg-amber-50 text-amber-700 border border-amber-200' }
  }

  return { variant: 'destructive' as const, className: 'bg-red-50 text-red-700 border border-red-200' }
}

export function ContainersPage() {
  const containersQuery = useQuery({ queryKey: queryKeys.containers, queryFn: getContainers })

  if (containersQuery.isPending) {
    return <LoadingState rows={6} />
  }

  if (containersQuery.error instanceof ApiError && containersQuery.error.code === 'FORBIDDEN') {
    return <PermissionDeniedState />
  }

  if (containersQuery.isError) {
    return (
      <ErrorState
        description="Could not load container list from backend."
        onRetry={() => containersQuery.refetch()}
        title="Container lookup failed"
      />
    )
  }

  if (containersQuery.data.length === 0) {
    return <EmptyState description="No running or managed containers were returned by the backend." title="No containers" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-base font-medium text-foreground">Containers</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pick a container when creating or editing exposures.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {containersQuery.data.length} container{containersQuery.data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="pl-5 text-xs">Name</TableHead>
                <TableHead className="text-xs">Image</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Ports</TableHead>
                <TableHead className="pr-5 text-xs">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containersQuery.data.map((container) => (
                <TableRow className="border-b border-border hover:bg-accent" key={container.id}>
                  <TableCell className="pl-5 font-mono text-sm">{container.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{container.image}</TableCell>
                  <TableCell>
                    <Badge {...statusVariant(container.status)}>{container.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {container.ports.length > 0 ? container.ports.join(', ') : '—'}
                  </TableCell>
                  <TableCell className="pr-5 text-xs text-muted-foreground">{container.uptime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
