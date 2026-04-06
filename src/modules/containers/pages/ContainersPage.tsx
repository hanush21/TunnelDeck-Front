import { useQuery } from '@tanstack/react-query'
import { getContainers } from '@/modules/containers/services/containers-service'
import { Badge } from '@/shared/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/state/EmptyState'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const statusVariant = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('up') || normalized.includes('running')) return 'success' as const
  if (normalized.includes('paused') || normalized.includes('restarting')) return 'warning' as const
  return 'destructive' as const
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
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold">Containers</h3>
        <p className="text-sm text-muted-foreground">Pick a container from this list when creating or editing exposures.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ports</TableHead>
            <TableHead>Uptime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containersQuery.data.map((container) => (
            <TableRow key={container.id}>
              <TableCell className="font-medium">{container.name}</TableCell>
              <TableCell>{container.image}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(container.status)}>{container.status}</Badge>
              </TableCell>
              <TableCell>{container.ports.length > 0 ? container.ports.join(', ') : 'n/a'}</TableCell>
              <TableCell>{container.uptime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
