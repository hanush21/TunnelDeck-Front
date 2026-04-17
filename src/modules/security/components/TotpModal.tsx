import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { totpSchema, type TotpSchema } from '@/modules/security/schemas/totp-schema'

type TotpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (totpCode: string) => Promise<void>
  isSubmitting?: boolean
  actionContext?: string
}

export function TotpModal({ open, onOpenChange, onSubmit, isSubmitting = false, actionContext }: TotpModalProps) {
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
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <DialogTitle>Two-factor verification</DialogTitle>
              {actionContext && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{actionContext}</p>
              )}
            </div>
          </div>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to continue.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-2">
            <Input
              autoComplete="one-time-code"
              autoFocus
              className="text-center font-mono text-lg tracking-[0.5em]"
              id="totpCode"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              {...register('totpCode')}
            />
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
