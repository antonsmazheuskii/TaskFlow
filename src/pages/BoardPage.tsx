import { Link, useParams } from 'react-router-dom'
import { BoardColumns } from '../components/board/BoardColumns'
import { BoardColumnsSkeleton } from '../components/board/BoardColumnsSkeleton'
import { AppHeader } from '../components/shared/AppHeader'
import { Skeleton } from '../components/shared/Skeleton'
import { useBoard } from '../hooks/useBoard'
import styles from './BoardPage.module.css'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { board, isLoading, error } = useBoard(boardId)

  if (isLoading) {
    return (
      <main className={styles.page}>
        <AppHeader breadcrumbs={[{ label: 'Загрузка…' }]} />
        <div className={styles.loadingTitle}>
          <Skeleton height="1.75rem" width="40%" />
        </div>
        <section className={styles.columns}>
          <BoardColumnsSkeleton />
        </section>
      </main>
    )
  }

  if (error || !board) {
    return (
      <main className={styles.page}>
        <AppHeader />
        <p className={styles.error} role="alert">
          {error ?? 'Доска не найдена.'}
        </p>
        <Link className={styles.back} to="/">
          Вернуться к списку досок
        </Link>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <AppHeader breadcrumbs={[{ label: board.title }]} />

      <section className={styles.columns} aria-label={`Доска ${board.title}`}>
        <BoardColumns boardId={board.id} />
      </section>
    </main>
  )
}
