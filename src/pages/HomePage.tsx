import { Link } from 'react-router-dom'
import { LogoutButton } from '../components/auth/LogoutButton'
import { useAuth } from '../providers/AuthProvider'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p>Загрузка…</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>TaskFlow</h1>
          <p className={styles.text}>Вы не вошли в аккаунт.</p>
          <div className={styles.actions}>
            <Link className={styles.link} to="/login">
              Войти
            </Link>
            <Link className={styles.link} to="/register">
              Регистрация
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>TaskFlow</h1>
        <p className={styles.text}>Вы вошли как {user.email}</p>
        <LogoutButton />
      </section>
    </main>
  )
}
