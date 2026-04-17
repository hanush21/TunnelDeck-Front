import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button className="mt-2" onClick={onRetry} size="sm" variant="outline">
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
