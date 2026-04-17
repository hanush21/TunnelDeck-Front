import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getContainers } from '@/modules/containers/services/containers-service'
import { ExposureFormDialog } from '@/modules/exposures/components/ExposureFormDialog'
import {
  createExposure,
  deleteExposure,
  getExposures,
  updateExposure,
} from '@/modules/exposures/services/exposures-service'
import type { ExposureDTO, UpsertExposureInput } from '@/modules/exposures/types/exposure'
import { TotpModal } from '@/modules/security/components/TotpModal'
import { EmptyState } from '@/shared/components/state/EmptyState'
import { ErrorState } from '@/shared/components/state/ErrorState'
import { LoadingState } from '@/shared/components/state/LoadingState'
import { PermissionDeniedState } from '@/shared/components/state/PermissionDeniedState'
import { queryKeys } from '@/shared/constants/query-keys'
import { ApiError } from '@/shared/lib/http-client'

type PendingAction =
  | { type: 'create'; payload: UpsertExposureInput }
  | { type: 'update'; id: string; payload: UpsertExposureInput }
  | { type: 'delete'; id: string; hostname: string }

const enabledBadge = (enabled: boolean) =>
  enabled
    ? { variant: 'secondary' as const, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    : { variant: 'outline' as const, className: 'bg-secondary text-muted-foreground border-border' }

export function ExposuresPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingExposure, setEditingExposure] = useState<ExposureDTO | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isTotpOpen, setIsTotpOpen] = useState(false)

  const exposuresQuery = useQuery({ queryKey: queryKeys.exposures, queryFn: getExposures })
  const containersQuery = useQuery({ queryKey: queryKeys.containers, queryFn: getContainers })

  const createMutation = useMutation({
    mutationFn: createExposure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exposures })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpsertExposureInput & { totpCode?: string } }) =>
      updateExposure(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exposures })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, totpCode }: { id: string; totpCode?: string }) => deleteExposure(id, totpCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exposures })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
    },
  })

  const totpActionContext = pendingAction
    ? pendingAction.type === 'create'
      ? `Creating: ${pendingAction.payload.hostname}`
      : pendingAction.type === 'update'
        ? `Updating: ${pendingAction.payload.hostname}`
        : `Deleting: ${pendingAction.hostname}`
    : undefined

  const handleTotpConfirm = async (totpCode: string) => {
    if (!pendingAction) return

    try {
      if (pendingAction.type === 'create') {
        await createMutation.mutateAsync({ ...pendingAction.payload, totpCode })
        toast.success('Exposure created', { description: `${pendingAction.payload.hostname} is now configured.` })
      } else if (pendingAction.type === 'update') {
        await updateMutation.mutateAsync({ id: pendingAction.id, values: { ...pendingAction.payload, totpCode } })
        toast.success('Exposure updated', { description: `${pendingAction.payload.hostname} has been saved.` })
      } else {
        await deleteMutation.mutateAsync({ id: pendingAction.id, totpCode })
        toast.success('Exposure deleted', { description: 'The hostname has been removed.' })
      }
      setPendingAction(null)
      setIsTotpOpen(false)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'TOTP_REQUIRED') {
        toast.error('Invalid TOTP code', {
          description: 'The code was rejected by the server. Please try again.',
        })
        // Keep modal open — TotpModal resets the input automatically
      } else if (error instanceof ApiError && error.code === 'FORBIDDEN') {
        toast.error('Permission denied')
        setPendingAction(null)
        setIsTotpOpen(false)
      } else {
        toast.error('Operation failed', {
          description: error instanceof ApiError ? error.message : 'Unexpected error while contacting backend.',
        })
        setPendingAction(null)
        setIsTotpOpen(false)
      }
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  if (exposuresQuery.isPending || containersQuery.isPending) {
    return <LoadingState rows={6} />
  }

  if (
    (exposuresQuery.error instanceof ApiError && exposuresQuery.error.code === 'FORBIDDEN') ||
    (containersQuery.error instanceof ApiError && containersQuery.error.code === 'FORBIDDEN')
  ) {
    return <PermissionDeniedState />
  }

  if (exposuresQuery.isError || containersQuery.isError) {
    return (
      <ErrorState
        description="Could not load exposures/containers from backend."
        onRetry={() => {
          exposuresQuery.refetch()
          containersQuery.refetch()
        }}
        title="Exposure management unavailable"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-medium text-foreground">Exposures</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage public hostnames and container mappings.</p>
        </div>

        <Button className="gap-1.5 text-xs" disabled={isMutating} onClick={() => setIsCreateOpen(true)} size="sm">
          <Plus className="h-3.5 w-3.5" />
          New exposure
        </Button>
      </div>

      {exposuresQuery.data.length === 0 ? (
        <EmptyState
          action={
            <Button disabled={isMutating} onClick={() => setIsCreateOpen(true)} size="sm">
              Create first exposure
            </Button>
          }
          description="No public hostnames are currently configured."
          title="No exposures"
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {exposuresQuery.data.length} exposure{exposuresQuery.data.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="pl-5 text-xs">Hostname</TableHead>
                  <TableHead className="text-xs">Service</TableHead>
                  <TableHead className="text-xs">Container</TableHead>
                  <TableHead className="text-xs">Target</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="pr-5 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exposuresQuery.data.map((exposure) => (
                  <TableRow className="border-b border-border hover:bg-accent" key={exposure.id}>
                    <TableCell className="pl-5 font-mono text-sm">{exposure.hostname}</TableCell>
                    <TableCell>
                      <span className="rounded border border-border px-1.5 py-0.5 font-mono text-xs uppercase text-muted-foreground">
                        {exposure.protocol}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{exposure.containerName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {exposure.targetHost}:{exposure.port}
                    </TableCell>
                    <TableCell>
                      <Badge {...enabledBadge(exposure.enabled)}>{exposure.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-40"
                          disabled={isMutating}
                          onClick={() => setEditingExposure(exposure)}
                          type="button"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-1.5 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                          disabled={isMutating}
                          onClick={() => {
                            setPendingAction({ type: 'delete', id: exposure.id, hostname: exposure.hostname })
                            setIsTotpOpen(true)
                          }}
                          type="button"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <ExposureFormDialog
        containers={containersQuery.data}
        description="Create a new public hostname and map it to a backend target."
        isSubmitting={isMutating}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values) => {
          setPendingAction({ type: 'create', payload: values })
          setIsTotpOpen(true)
        }}
        open={isCreateOpen}
        title="Create exposure"
      />

      <ExposureFormDialog
        containers={containersQuery.data}
        description="Update hostname routing details. Backend will still validate all rules."
        initialValues={
          editingExposure
            ? {
                hostname: editingExposure.hostname,
                protocol: editingExposure.protocol,
                containerName: editingExposure.containerName,
                targetHost: editingExposure.targetHost,
                port: editingExposure.port,
                enabled: editingExposure.enabled,
              }
            : undefined
        }
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExposure(null)
          }
        }}
        onSubmit={async (values) => {
          if (!editingExposure) return
          setPendingAction({ type: 'update', id: editingExposure.id, payload: values })
          setIsTotpOpen(true)
        }}
        open={Boolean(editingExposure)}
        title="Edit exposure"
      />

      <TotpModal
        actionContext={totpActionContext}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          setIsTotpOpen(open)
          if (!open) {
            setPendingAction(null)
          }
        }}
        onSubmit={handleTotpConfirm}
        open={isTotpOpen}
      />
    </div>
  )
}
