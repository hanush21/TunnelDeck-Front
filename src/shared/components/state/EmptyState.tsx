import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
