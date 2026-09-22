import { useEffect } from 'react'
import { useComments } from '../../hooks/useComments'
import { useAuth } from '../../providers/AuthProvider'
import { useNotification } from '../../providers/NotificationProvider'
import { Spinner } from '../shared/Spinner'
import { AddCommentForm } from './AddCommentForm'
import { CommentItem } from './CommentItem'
import styles from './TaskComments.module.css'

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
    <section className={styles.section} aria-labelledby="comments-heading">
      <h3 id="comments-heading" className={styles.title}>
        Комментарии
      </h3>

      {isLoading ? (
        <Spinner label="Загрузка комментариев…" />
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>Комментариев пока нет.</p>
      ) : (
        <ul className={styles.list}>
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
