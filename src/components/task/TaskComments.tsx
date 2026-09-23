import { useEffect } from 'react'
import { useComments } from '../../hooks/useComments'
import { useAuth } from '../../providers/AuthProvider'
import { useNotification } from '../../providers/NotificationProvider'
import { Spinner } from '../shared/Spinner'
import { AddCommentForm } from './AddCommentForm'
import { CommentItem } from './CommentItem'
import { ui } from '../../lib/ui'

type TaskCommentsProps = {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth()
  const { notifyError } = useNotification()
  const { comments, isLoading, error, createComment, deleteComment } =
    useComments(taskId)

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  return (
    <section aria-labelledby="comments-heading">
      <h3
        id="comments-heading"
        className="mb-3 text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100"
      >
        Комментарии
      </h3>

      {isLoading ? (
        <Spinner label="Загрузка комментариев…" />
      ) : error ? (
        <p className={ui.errorBox} role="alert">
          {error}
        </p>
      ) : comments.length === 0 ? (
        <div className={`${ui.empty} mb-4 py-6`}>
          Комментариев пока нет.
        </div>
      ) : (
        <ul className="mb-4 flex list-none flex-col gap-2.5 p-0">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={user?.id === comment.user_id}
              onDelete={deleteComment}
            />
          ))}
        </ul>
      )}

      <AddCommentForm onAdd={createComment} />
    </section>
  )
}
