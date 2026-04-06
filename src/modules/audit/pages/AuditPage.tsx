import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditEntries } from '@/modules/audit/services/audit-service'
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

  if (['ok', 'success', 'completed'].some((entry) => normalized.includes(entry))) return 'success' as const
  if (['pending', 'in_progress'].some((entry) => normalized.includes(entry))) return 'warning' as const
  return 'destructive' as const
}

export function AuditPage() {
  const auditQuery = useQuery({ queryKey: queryKeys.audit, queryFn: getAuditEntries })

  const rows = useMemo(
    () =>
      auditQuery.data?.map((entry) => ({
        ...entry,
        timestampLabel: new Date(entry.timestamp).toLocaleString(),
      })) ?? [],
    [auditQuery.data],
  )

  if (auditQuery.isPending) {
    return <LoadingState rows={6} />
  }

  if (auditQuery.error instanceof ApiError && auditQuery.error.code === 'FORBIDDEN') {
    return <PermissionDeniedState />
  }

  if (auditQuery.isError) {
    return <ErrorState description="Audit log could not be loaded." onRetry={() => auditQuery.refetch()} title="Audit unavailable" />
  }

  if (rows.length === 0) {
    return <EmptyState description="No recent actions were returned by the backend." title="No audit entries" />
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold">Audit</h3>
        <p className="text-sm text-muted-foreground">Recent administrative actions and their execution status.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.actor}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.target}</TableCell>
              <TableCell>{entry.timestampLabel}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
