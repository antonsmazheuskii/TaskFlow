import { Link, useParams } from 'react-router-dom'
import { BoardColumns } from '../components/board/BoardColumns'
import { useBoard } from '../hooks/useBoard'
import styles from './BoardPage.module.css'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { board, isLoading, error } = useBoard(boardId)

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Загрузка доски…</p>
      </main>
    )
  }

  if (error || !board) {
    return (
      <main className={styles.page}>
        <p className={styles.error} role="alert">
          {error ?? 'Доска не найдена.'}
        </p>
        <Link className={styles.back} to="/">
          К списку досок
        </Link>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/">
          ← К списку досок
        </Link>
        <h1 className={styles.title}>{board.title}</h1>
      </header>

      <section className={styles.columns}>
        <BoardColumns boardId={board.id} />
      </section>
    </main>
  )
}
