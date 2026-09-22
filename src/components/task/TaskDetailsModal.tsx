import { Modal } from '../shared/Modal'
import type { Task } from '../../types/task'
import styles from './TaskDetailsModal.module.css'

type TaskDetailsModalProps = {
  task: Task
  onClose: () => void
}

export function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
  return (
    <Modal title={task.title} onClose={onClose}>
      <p className={styles.hint}>Детали задачи</p>
    </Modal>
  )
}
