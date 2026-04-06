import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { totpSchema, type TotpSchema } from '@/modules/security/schemas/totp-schema'

type TotpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (totpCode: string) => Promise<void>
  isSubmitting?: boolean
}

export function TotpModal({ open, onOpenChange, onSubmit, isSubmitting = false }: TotpModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TotpSchema>({
    resolver: zodResolver(totpSchema),
    defaultValues: { totpCode: '' },
  })

  const submitHandler = handleSubmit(async ({ totpCode }) => {
    await onSubmit(totpCode)
    reset()
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
          <DialogTitle>TOTP verification required</DialogTitle>
          <DialogDescription>
            This operation is protected by two-factor verification. Enter your 6-digit authenticator code.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-2">
            <Label htmlFor="totpCode">TOTP code</Label>
            <Input autoComplete="one-time-code" id="totpCode" placeholder="123456" {...register('totpCode')} />
            {errors.totpCode ? <p className="text-xs text-destructive">{errors.totpCode.message}</p> : null}
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verifying...' : 'Verify and continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
