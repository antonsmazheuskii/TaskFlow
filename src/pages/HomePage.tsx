import { LogoutButton } from '../components/auth/LogoutButton'
import { useAuth } from '../providers/AuthProvider'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user } = useAuth()

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>TaskFlow</h1>
        <p className={styles.text}>Вы вошли как {user?.email}</p>
        <LogoutButton />
      </section>
    </main>
  )
}
