import type { Task } from '../../types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.title}>{task.title}</p>
    </article>
  )
}
