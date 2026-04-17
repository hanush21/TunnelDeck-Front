import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <Skeleton className="h-3.5 w-32" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton className="h-9 w-full" key={index} />
        ))}
      </div>
    </div>
  )
}
