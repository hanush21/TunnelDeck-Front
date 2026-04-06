import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { ContainerDTO } from '@/modules/containers/types/container'
import { exposureSchema, type ExposureSchema } from '@/modules/exposures/schemas/exposure-schemas'
import type { UpsertExposureInput } from '@/modules/exposures/types/exposure'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

type ExposureFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpsertExposureInput) => Promise<void>
  containers: ContainerDTO[]
  initialValues?: UpsertExposureInput
  isSubmitting?: boolean
  title: string
  description: string
}

export function ExposureFormDialog({
  open,
  onOpenChange,
  onSubmit,
  containers,
  initialValues,
  isSubmitting = false,
  title,
  description,
}: ExposureFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExposureSchema>({
    resolver: zodResolver(exposureSchema),
    defaultValues: initialValues ?? {
      hostname: '',
      protocol: 'https',
      containerId: '',
      port: 80,
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset(
      initialValues ?? {
        hostname: '',
        protocol: 'https',
        containerId: '',
        port: 80,
      },
    )
  }, [initialValues, open, reset])

  const submitHandler = handleSubmit(async (values: ExposureSchema) => {
    await onSubmit(values)
    onOpenChange(false)
  })

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          reset()
        }
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input id="hostname" placeholder="api.example.com" {...register('hostname')} />
            {errors.hostname ? <p className="text-xs text-destructive">{errors.hostname.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Controller
                control={control}
                name="protocol"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="https">HTTPS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.protocol ? <p className="text-xs text-destructive">{errors.protocol.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" type="number" {...register('port', { valueAsNumber: true })} />
              {errors.port ? <p className="text-xs text-destructive">{errors.port.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Container</Label>
            <Controller
              control={control}
              name="containerId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a container" />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.name} ({container.image})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.containerId ? <p className="text-xs text-destructive">{errors.containerId.message}</p> : null}
          </div>

          <Button className="w-full" disabled={isSubmitting || containers.length === 0} type="submit">
            {isSubmitting ? 'Saving...' : 'Save exposure'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
