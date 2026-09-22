import { LogoutButton } from '../components/auth/LogoutButton'
import { BoardsList } from '../components/board/BoardsList'
import { useAuth } from '../providers/AuthProvider'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user } = useAuth()

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>TaskFlow</h1>
          <p className={styles.user}>{user?.email}</p>
        </div>
        <LogoutButton />
      </header>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>Мои доски</h2>
        <BoardsList />
      </section>
    </main>
  )
}
