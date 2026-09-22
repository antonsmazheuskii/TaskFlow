import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Board } from '../../types/board'
import styles from './BoardListItem.module.css'

type BoardListItemProps = {
  board: Board
  onDelete: (boardId: string) => Promise<void>
}

export function BoardListItem({ board, onDelete }: BoardListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = window.confirm(
      `Удалить доску «${board.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setError(null)
    setIsDeleting(true)

    try {
      await onDelete(board.id)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось удалить доску.'
      setError(message)
      setIsDeleting(false)
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <Link className={styles.title} to={`/boards/${board.id}`}>
          {board.title}
        </Link>
        <button
          className={styles.delete}
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Удаление…' : 'Удалить'}
        </button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </li>
  )
}
