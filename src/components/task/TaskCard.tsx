import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: 'task',
        columnId: task.column_id,
      },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={styles.card}
      {...listeners}
      {...attributes}
    >
      <p className={styles.title}>{task.title}</p>
    </article>
  )
}
