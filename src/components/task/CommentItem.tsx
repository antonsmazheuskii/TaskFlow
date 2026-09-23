import { useState } from 'react'
import { UserAvatar } from '../shared/UserAvatar'
import { useNotification } from '../../providers/NotificationProvider'
import type { Comment } from '../../types/comment'
import { formatDateTime } from '../../utils/formatDateTime'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

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
    <li className="flex list-none flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start gap-2.5">
        <UserAvatar
          name={comment.author_name}
          avatarUrl={comment.author_avatar_url}
          size="md"
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {comment.author_name}
          </span>
          <time
            className="text-xs text-slate-500 dark:text-slate-400"
            dateTime={comment.created_at}
          >
            {formatDateTime(comment.created_at)}
          </time>
        </div>
      </div>
      <p className="m-0 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-800 dark:text-slate-200">
        {comment.content}
      </p>
      {canDelete ? (
        <button
          className={`${ui.btnDanger} self-start !min-h-0 px-2.5 py-1.5 text-xs`}
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
