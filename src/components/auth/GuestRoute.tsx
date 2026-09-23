import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { Spinner } from '../shared/Spinner'
import { ui } from '../../lib/ui'

export function GuestRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className={ui.page}>
        <Spinner label="Проверка сессии…" />
      </main>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
