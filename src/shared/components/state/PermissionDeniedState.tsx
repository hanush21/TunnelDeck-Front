import { Lock } from 'lucide-react'

export function PermissionDeniedState() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Permission denied</p>
          <p className="text-sm text-muted-foreground">
            Your account is authenticated, but the backend rejected this action for authorization reasons.
          </p>
        </div>
      </div>
    </div>
  )
}
