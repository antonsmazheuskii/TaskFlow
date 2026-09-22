import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type MouseEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import type { Task } from '../../types/task'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
  onDelete: (taskId: string) => Promise<void>
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      columnId: task.column_id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = window.confirm(
      `Удалить задачу «${task.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(task.id)
      notifySuccess('Задача удалена.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить задачу.'))
      setIsDeleting(false)
    }
  }

  return (
    <article ref={setNodeRef} style={style} className={styles.card}>
      <div className={styles.content} {...listeners} {...attributes}>
        <p className={styles.title}>{task.title}</p>
      </div>
      <button
        className={styles.delete}
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Удалить задачу ${task.title}`}
      >
        {isDeleting ? '…' : '×'}
      </button>
    </article>
  )
}
