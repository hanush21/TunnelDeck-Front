import { Lock } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PermissionDeniedState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Lock className="h-5 w-5" />
          Permission denied
        </CardTitle>
        <CardDescription>
          Your account is authenticated, but the backend rejected this action for authorization reasons.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
