import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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
  | { type: 'delete'; id: string }

const enabledBadge = (enabled: boolean) =>
  enabled
    ? { variant: 'secondary' as const, className: 'bg-emerald-500/18 text-emerald-300 ring-1 ring-emerald-500/25' }
    : { variant: 'outline' as const, className: 'border-zinc-500/35 bg-zinc-500/12 text-zinc-300' }

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

  const requiresTotpFlow = (error: unknown, action: PendingAction, hasCode: boolean) => {
    if (!(error instanceof ApiError)) {
      return false
    }

    if (error.code !== 'TOTP_REQUIRED') {
      return false
    }

    if (hasCode) {
      toast.error('TOTP verification failed', {
        description: 'The provided code was rejected by backend.',
      })
      return true
    }

    setPendingAction(action)
    setIsTotpOpen(true)

    toast.info('Additional verification required', {
      description: 'Enter your TOTP code to complete this operation.',
    })

    return true
  }

  const handleMutationError = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.code === 'FORBIDDEN') {
        toast.error('Permission denied')
        return
      }

      toast.error('Operation failed', { description: error.message })
      return
    }

    toast.error('Operation failed', { description: 'Unexpected error while contacting backend.' })
  }

  const executeCreate = async (values: UpsertExposureInput, totpCode?: string) => {
    try {
      await createMutation.mutateAsync({ ...values, totpCode })
      toast.success('Exposure created successfully')
    } catch (error) {
      const controlled = requiresTotpFlow(error, { type: 'create', payload: values }, Boolean(totpCode))
      if (!controlled) {
        handleMutationError(error)
      }
    }
  }

  const executeUpdate = async (exposureId: string, values: UpsertExposureInput, totpCode?: string) => {
    try {
      await updateMutation.mutateAsync({ id: exposureId, values: { ...values, totpCode } })
      toast.success('Exposure updated successfully')
    } catch (error) {
      const controlled = requiresTotpFlow(error, { type: 'update', id: exposureId, payload: values }, Boolean(totpCode))
      if (!controlled) {
        handleMutationError(error)
      }
    }
  }

  const executeDelete = async (exposureId: string, totpCode?: string) => {
    try {
      await deleteMutation.mutateAsync({ id: exposureId, totpCode })
      toast.success('Exposure deleted successfully')
    } catch (error) {
      const controlled = requiresTotpFlow(error, { type: 'delete', id: exposureId }, Boolean(totpCode))
      if (!controlled) {
        handleMutationError(error)
      }
    }
  }

  const handleTotpConfirm = async (totpCode: string) => {
    if (!pendingAction) return

    if (pendingAction.type === 'create') {
      await executeCreate(pendingAction.payload, totpCode)
    }

    if (pendingAction.type === 'update') {
      await executeUpdate(pendingAction.id, pendingAction.payload, totpCode)
    }

    if (pendingAction.type === 'delete') {
      await executeDelete(pendingAction.id, totpCode)
    }

    setPendingAction(null)
    setIsTotpOpen(false)
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold">Exposures</h3>
          <p className="text-sm text-muted-foreground">Manage public hostnames and container mappings.</p>
        </div>

        <Button className="gap-2" disabled={isMutating} onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New exposure
        </Button>
      </div>

      {exposuresQuery.data.length === 0 ? (
        <EmptyState
          action={
            <Button disabled={isMutating} onClick={() => setIsCreateOpen(true)}>
              Create first exposure
            </Button>
          }
          description="No public hostnames are currently configured."
          title="No exposures"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hostname</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Container</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exposuresQuery.data.map((exposure) => (
              <TableRow key={exposure.id}>
                <TableCell className="font-medium">{exposure.hostname}</TableCell>
                <TableCell className="uppercase">{exposure.protocol}</TableCell>
                <TableCell>{exposure.containerName}</TableCell>
                <TableCell>
                  {exposure.targetHost}:{exposure.port}
                </TableCell>
                <TableCell>
                  <Badge {...enabledBadge(exposure.enabled)}>{exposure.enabled ? 'enabled' : 'disabled'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button disabled={isMutating} onClick={() => setEditingExposure(exposure)} size="sm" variant="secondary">
                      Edit
                    </Button>
                    <Button
                      disabled={isMutating}
                      onClick={() => executeDelete(exposure.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ExposureFormDialog
        containers={containersQuery.data}
        description="Create a new public hostname and map it to a backend target."
        isSubmitting={isMutating}
        onOpenChange={setIsCreateOpen}
        onSubmit={executeCreate}
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
          await executeUpdate(editingExposure.id, values)
          setEditingExposure(null)
        }}
        open={Boolean(editingExposure)}
        title="Edit exposure"
      />

      <TotpModal
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
