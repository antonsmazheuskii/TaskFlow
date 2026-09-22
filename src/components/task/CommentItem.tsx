import { useState } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import type { Comment } from '../../types/comment'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './CommentItem.module.css'

type CommentItemProps = {
  comment: Comment
  canDelete: boolean
  onDelete: (commentId: string) => Promise<void>
}

export function CommentItem({
  comment,
  canDelete,
  onDelete,
}: CommentItemProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm('Удалить комментарий?')

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(comment.id)
      notifySuccess('Комментарий удалён.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить комментарий.'))
      setIsDeleting(false)
    }
  }

  return (
    <li className={styles.item}>
      <p className={styles.content}>{comment.content}</p>
      {canDelete ? (
        <button
          className={styles.delete}
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '…' : 'Удалить'}
        </button>
      ) : null}
    </li>
  )
}
