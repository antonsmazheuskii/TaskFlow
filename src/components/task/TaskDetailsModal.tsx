import { useNotification } from '../../providers/NotificationProvider'
import type { Task, TaskDetailsUpdate } from '../../types/task'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../shared/Modal'
import { TaskDetailsForm } from './TaskDetailsForm'

type TaskDetailsModalProps = {
  task: Task
  onSave: (taskId: string, details: TaskDetailsUpdate) => Promise<void>
  onClose: () => void
}

export function TaskDetailsModal({
  task,
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
      <TaskDetailsForm task={task} onSave={handleSave} onCancel={onClose} />
    </Modal>
  )
}
