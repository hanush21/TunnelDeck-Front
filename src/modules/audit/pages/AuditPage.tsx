import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditEntries } from '@/modules/audit/services/audit-service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/state/EmptyState'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

const statusVariant = (status: string) => {
  const normalized = status.toLowerCase()

  if (['ok', 'success', 'completed'].some((entry) => normalized.includes(entry))) {
    return { variant: 'secondary' as const, className: 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20' }
  }

  if (['pending', 'in_progress'].some((entry) => normalized.includes(entry))) {
    return { variant: 'outline' as const, className: 'border-amber-500/30 bg-amber-500/10 text-amber-700' }
  }

  return { variant: 'destructive' as const, className: 'bg-red-500/15 text-red-700 ring-1 ring-red-500/20' }
}

export function AuditPage() {
  const auditQuery = useQuery({ queryKey: queryKeys.audit, queryFn: () => getAuditEntries(100) })

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Audit Log</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Recent administrative actions and their execution status.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {rows.length} entr{rows.length !== 1 ? 'ies' : 'y'} — last 100
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="pl-5 text-xs">Actor</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Target</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="pr-5 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((entry) => (
                  <TableRow className="border-b border-border/50" key={entry.id}>
                    <TableCell className="pl-5 font-mono text-sm font-medium">{entry.actor}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{entry.action}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{entry.target}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.timestampLabel}</TableCell>
                    <TableCell className="pr-5">
                      <Badge {...statusVariant(entry.status)}>{entry.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
