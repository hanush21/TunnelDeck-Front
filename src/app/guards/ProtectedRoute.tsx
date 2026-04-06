import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { LoadingState } from '@/shared/components/state/LoadingState'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <LoadingState rows={6} />
      </div>
    )
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
