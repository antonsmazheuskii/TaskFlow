import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../providers/NotificationProvider'
import type { Board } from '../../types/board'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

type BoardListItemProps = {
  board: Board
  canDelete: boolean
  onDelete: (boardId: string) => Promise<void>
}

export function BoardListItem({
  board,
  canDelete,
  onDelete,
}: BoardListItemProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!canDelete) {
      return
    }

    const confirmed = window.confirm(
      `Удалить доску «${board.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(board.id)
      notifySuccess('Доска удалена.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить доску.'))
      setIsDeleting(false)
    }
  }

  return (
    <li className={`${ui.card} transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="text-base font-semibold text-teal-700 transition hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
          to={`/boards/${board.id}`}
        >
          {board.title}
        </Link>
        {canDelete ? (
          <button
            className={ui.btnDanger}
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление…' : 'Удалить'}
          </button>
        ) : (
          <span className="inline-flex self-start rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Member
          </span>
        )}
      </div>
    </li>
  )
}
