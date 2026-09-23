import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { Spinner } from '../shared/Spinner'
import { ui } from '../../lib/ui'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className={ui.page}>
        <Spinner label="Проверка сессии…" />
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
