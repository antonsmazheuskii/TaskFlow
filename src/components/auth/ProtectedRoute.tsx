import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import styles from './ProtectedRoute.module.css'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className={styles.loading}>
        <p>Загрузка…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
