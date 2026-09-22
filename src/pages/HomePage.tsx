import { BoardsList } from '../components/board/BoardsList'
import { CreateBoardForm } from '../components/board/CreateBoardForm'
import { AppHeader } from '../components/shared/AppHeader'
import { useBoards } from '../hooks/useBoards'
import styles from './HomePage.module.css'

export function HomePage() {
  const { boards, isLoading, error, createBoard, deleteBoard } = useBoards()

  return (
    <main className={styles.page}>
      <AppHeader />

      <section className={styles.content} aria-labelledby="boards-heading">
        <h2 id="boards-heading" className={styles.sectionTitle}>
          Мои доски
        </h2>
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
