import type { BoardMember } from '../../types/boardMember'
import type { Task, TaskDetailsUpdate } from '../../types/task'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../shared/Modal'
import { TaskComments } from './TaskComments'
import { TaskDetailsForm } from './TaskDetailsForm'
import styles from './TaskDetailsModal.module.css'

type TaskDetailsModalProps = {
  task: Task
  members: BoardMember[]
  areMembersLoading: boolean
  onSave: (taskId: string, details: TaskDetailsUpdate) => Promise<void>
  onClose: () => void
}

export function TaskDetailsModal({
  task,
  members,
  areMembersLoading,
  onSave,
  onClose,
}: TaskDetailsModalProps) {
  const { notifyError, notifySuccess } = useNotification()

  async function handleSave(details: TaskDetailsUpdate) {
    try {
      await onSave(task.id, details)
      notifySuccess('Задача сохранена.')
      onClose()
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось сохранить задачу.'))
    }
  }

  return (
    <Modal title="Детали задачи" onClose={onClose}>
      <div className={styles.content}>
        <TaskDetailsForm
          task={task}
          members={members}
          areMembersLoading={areMembersLoading}
          onSave={handleSave}
          onCancel={onClose}
        />
        <TaskComments taskId={task.id} />
      </div>
    </Modal>
  )
}
