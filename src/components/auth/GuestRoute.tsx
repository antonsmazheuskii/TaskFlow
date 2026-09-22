import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { Spinner } from '../shared/Spinner'
import styles from './ProtectedRoute.module.css'

export function GuestRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className={styles.loading}>
        <Spinner label="Проверка сессии…" />
      </main>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
