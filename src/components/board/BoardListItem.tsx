import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../providers/NotificationProvider'
import type { Board } from '../../types/board'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './BoardListItem.module.css'

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
    <li className={styles.item}>
      <div className={styles.row}>
        <Link className={styles.title} to={`/boards/${board.id}`}>
          {board.title}
        </Link>
        {canDelete ? (
          <button
            className={styles.delete}
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление…' : 'Удалить'}
          </button>
        ) : (
          <span className={styles.role}>Member</span>
        )}
      </div>
    </li>
  )
}
