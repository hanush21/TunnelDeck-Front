import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { ContainerDTO } from '@/modules/containers/types/container'
import { exposureSchema, type ExposureSchema } from '@/modules/exposures/schemas/exposure-schemas'
import type { UpsertExposureInput } from '@/modules/exposures/types/exposure'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const defaultValues: UpsertExposureInput = {
  hostname: '',
  protocol: 'https',
  containerName: '',
  targetHost: 'localhost',
  port: 80,
  enabled: true,
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
    defaultValues: initialValues ?? defaultValues,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset(initialValues ?? defaultValues)
  }, [initialValues, open, reset])

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
    onOpenChange(false)
  })

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          reset(defaultValues)
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
            <Input id="hostname" placeholder="app.example.com" {...register('hostname')} />
            {errors.hostname ? <p className="text-xs text-destructive">{errors.hostname.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Service type</Label>
              <Controller
                control={control}
                name="protocol"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
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
              <Label htmlFor="port">Target port</Label>
              <Input id="port" type="number" {...register('port', { valueAsNumber: true })} />
              {errors.port ? <p className="text-xs text-destructive">{errors.port.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetHost">Target host</Label>
            <Input id="targetHost" placeholder="localhost" {...register('targetHost')} />
            {errors.targetHost ? <p className="text-xs text-destructive">{errors.targetHost.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Container</Label>
            <Controller
              control={control}
              name="containerName"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a container" />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.name}>
                        {container.name} ({container.image})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.containerName ? <p className="text-xs text-destructive">{errors.containerName.message}</p> : null}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border/80 px-3 py-2">
            <input className="size-4" id="enabled" type="checkbox" {...register('enabled')} />
            <Label className="cursor-pointer" htmlFor="enabled">
              Exposure enabled
            </Label>
          </div>

          <Button className="w-full" disabled={isSubmitting || containers.length === 0} type="submit">
            {isSubmitting ? 'Saving...' : 'Save exposure'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
