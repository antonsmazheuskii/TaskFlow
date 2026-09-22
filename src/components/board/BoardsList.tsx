import { useEffect } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import type { Board } from '../../types/board'
import { BoardListItem } from './BoardListItem'
import { BoardsListSkeleton } from './BoardsListSkeleton'
import styles from './BoardsList.module.css'

type BoardsListProps = {
  boards: Board[]
  isLoading: boolean
  error: string | null
  onDelete: (boardId: string) => Promise<void>
}

export function BoardsList({
  boards,
  isLoading,
  error,
  onDelete,
}: BoardsListProps) {
  const { notifyError } = useNotification()

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  if (isLoading) {
    return <BoardsListSkeleton />
  }

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )
  }

  if (boards.length === 0) {
    return <p className={styles.status}>У вас пока нет досок.</p>
  }

  return (
    <ul className={styles.list}>
      {boards.map((board) => (
        <BoardListItem key={board.id} board={board} onDelete={onDelete} />
      ))}
    </ul>
  )
}
