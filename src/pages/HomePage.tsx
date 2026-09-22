import { LogoutButton } from '../components/auth/LogoutButton'
import { BoardsList } from '../components/board/BoardsList'
import { CreateBoardForm } from '../components/board/CreateBoardForm'
import { useBoards } from '../hooks/useBoards'
import { useAuth } from '../providers/AuthProvider'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user } = useAuth()
  const { boards, isLoading, error, createBoard, deleteBoard } = useBoards()

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
        <CreateBoardForm onCreate={createBoard} />
        <BoardsList
          boards={boards}
          isLoading={isLoading}
          error={error}
          onDelete={deleteBoard}
        />
      </section>
    </main>
  )
}
