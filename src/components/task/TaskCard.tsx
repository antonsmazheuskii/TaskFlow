import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type MouseEvent } from 'react'
import type { Task } from '../../types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
  onDelete: (taskId: string) => Promise<void>
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    setError(null)
    setIsDeleting(true)

    try {
      await onDelete(task.id)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось удалить задачу.'
      setError(message)
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
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}
