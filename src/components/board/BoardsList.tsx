import { useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useNotification } from '../../providers/NotificationProvider'
import type { Board } from '../../types/board'
import { BoardListItem } from './BoardListItem'
import { BoardsListSkeleton } from './BoardsListSkeleton'
import { ui } from '../../lib/ui'

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
  const { user } = useAuth()
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
      <p className={ui.errorBox} role="alert">
        {error}
      </p>
    )
  }

  if (boards.length === 0) {
    return (
      <div className={ui.empty}>
        <p className="font-medium text-slate-700 dark:text-slate-200">
          Пока нет досок
        </p>
        <p className="mt-1">Создайте первую доску, чтобы начать работу.</p>
      </div>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {boards.map((board) => (
        <BoardListItem
          key={board.id}
          board={board}
          canDelete={user?.id === board.owner_id}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
